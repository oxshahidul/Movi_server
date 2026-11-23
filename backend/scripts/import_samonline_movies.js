/**
 * ScreenBox - SamOnline BDIX Movie Batch Ingestion with TMDB Enrichment
 * Ingests 100 movies from SamOnline (172.16.50.7) into MySQL via Prisma.
 */

const { PrismaClient, ContentType, ContentStatus } = require('@prisma/client');
const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY || '35710b2c7bea4a6fe3417921fbfbea58';
const BASE_HOST = 'http://172.16.50.7';
const DIRECTORY_URL = 'http://172.16.50.7/DHAKA-FLIX-7/English%20Movies/%282026%29/';
const TARGET_COUNT = parseInt(process.env.TARGET_COUNT || '100', 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function cleanFolderName(folderName) {
  let title = decodeURIComponent(folderName).replace(/\/$/, '');
  
  // If a path was passed, take the last segment
  if (title.includes('/')) {
    const parts = title.split('/').filter(Boolean);
    title = parts[parts.length - 1];
  }

  // Extract year
  const yearMatch = title.match(/\((19\d\d|20\d\d)\)/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

  // Extract quality
  const qualityMatch = title.match(/\b(720p|1080p|2160p|4k)\b/i);
  const quality = qualityMatch ? qualityMatch[1].toUpperCase() : '720P';

  // Strip anything after (YYYY) or quality or bracket tags
  title = title.replace(/\((19\d\d|20\d\d)\).*/, '');
  title = title.replace(/\[.*?\]/g, '');
  title = title.replace(/\b(720p|1080p|2160p|4k|NF|AMZN|DSNP|WEBRip|WEB-DL|BluRay|Dual Audio|x264|x265|HEVC|Hindi|English|MSubs)\b/gi, '');
  title = title.replace(/[-_.]+/g, ' ');
  title = title.replace(/\s+/g, ' ').trim();

  return { cleanTitle: title, year, quality };
}

async function fetchDirectoryFolders() {
  console.log(`🌐 Crawling directory listing: ${DIRECTORY_URL}`);
  const res = await fetch(DIRECTORY_URL, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) {
    throw new Error(`Failed to fetch directory listing: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();

  const linkMatches = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  const folders = linkMatches
    .map((m) => ({
      href: m[1],
      name: m[2].replace(/<[^>]+>/g, '').trim(),
    }))
    .filter(
      (l) =>
        !l.href.startsWith('?') &&
        !l.href.startsWith('#') &&
        !l.href.includes('_h5ai') &&
        l.name !== 'parent directory' &&
        l.name !== 'Parent Directory' &&
        l.name !== 'modern browsers' &&
        !l.name.includes('powered by') &&
        l.href.endsWith('/')
    );

  console.log(`📁 Found ${folders.length} movie folders in directory.`);
  return folders;
}

async function findVideoInFolder(folderHref) {
  const folderUrl = folderHref.startsWith('http') ? folderHref : `${BASE_HOST}${folderHref}`;
  const res = await fetch(folderUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const html = await res.text();

  const linkMatches = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  const files = linkMatches
    .map((m) => ({
      href: m[1],
      name: m[2].replace(/<[^>]+>/g, '').trim(),
    }))
    .filter((f) => {
      const lower = f.href.toLowerCase();
      return (
        (lower.endsWith('.mkv') || lower.endsWith('.mp4') || lower.endsWith('.avi') || lower.endsWith('.webm')) &&
        !lower.includes('sample')
      );
    });

  if (files.length === 0) return null;

  // Pick first primary video file
  const videoFile = files[0];
  const videoUrl = videoFile.href.startsWith('http') ? videoFile.href : `${BASE_HOST}${videoFile.href}`;
  const isMp4 = videoFile.href.toLowerCase().endsWith('.mp4');

  return {
    videoUrl,
    fileName: videoFile.name,
    format: isMp4 ? 'MP4' : 'MKV',
  };
}

async function searchTMDB(query, year) {
  try {
    let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&year=${year}`;
    let res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
    let data = await res.json();

    if (!data.results || data.results.length === 0) {
      // Retry without year restriction
      searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
      res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
      data = await res.json();
    }

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const tmdbId = data.results[0].id;

    // Fetch complete movie details with credits and videos
    const detailUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;
    const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(10000) });
    const movieData = await detailRes.json();

    return movieData;
  } catch (err) {
    console.error(`  ⚠️ TMDB search error for "${query}":`, err.message);
    return null;
  }
}

async function importMovie(movieData, videoInfo, quality) {
  const { title, id: tmdbId, overview, poster_path, backdrop_path, release_date, runtime, vote_average, original_language, genres: tmdbGenres, credits, videos } = movieData;

  const year = release_date ? parseInt(release_date.slice(0, 4), 10) : 2026;
  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${year}-${tmdbId}`;

  const poster = poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null;
  const backdrop = backdrop_path ? `https://image.tmdb.org/t/p/original${backdrop_path}` : poster;
  
  const trailer = videos?.results?.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  // 1. Upsert Genres
  const genreIds = [];
  if (tmdbGenres && tmdbGenres.length > 0) {
    for (const g of tmdbGenres) {
      const gSlug = slugify(g.name);
      const genre = await prisma.genre.upsert({
        where: { slug: gSlug },
        update: { name: g.name },
        create: { name: g.name, slug: gSlug },
      });
      genreIds.push(genre.id);
    }
  }

  // 2. Check if movie already exists by slug or tmdb title
  let movie = await prisma.movie.findFirst({
    where: {
      OR: [{ slug }, { title, releaseYear: year }],
    },
  });

  if (movie) {
    // Update existing movie
    movie = await prisma.movie.update({
      where: { id: movie.id },
      data: {
        title,
        description: overview || movie.description,
        poster: poster || movie.poster,
        backdrop: backdrop || movie.backdrop,
        trailerUrl: trailerUrl || movie.trailerUrl,
        releaseYear: year,
        runtime: runtime || movie.runtime,
        rating: vote_average ? parseFloat(vote_average.toFixed(1)) : movie.rating,
        language: original_language ? original_language.toUpperCase() : 'EN',
      },
    });

    // Check if video source already exists
    const existingSource = await prisma.videoSource.findFirst({
      where: { movieId: movie.id, sourceUrl: videoInfo.videoUrl },
    });

    if (!existingSource) {
      await prisma.videoSource.create({
        data: {
          contentType: ContentType.MOVIE,
          movieId: movie.id,
          sourceName: `SamOnline BDIX (${quality} Dual Audio)`,
          sourceUrl: videoInfo.videoUrl,
          quality: quality,
          format: videoInfo.format,
          status: 'ACTIVE',
        },
      });
    }
  } else {
    // Create new movie
    movie = await prisma.movie.create({
      data: {
        title,
        slug,
        description: overview || `Stream ${title} in HD on ScreenBox.`,
        poster,
        backdrop,
        trailerUrl,
        releaseYear: year,
        runtime: runtime || 110,
        rating: vote_average ? parseFloat(vote_average.toFixed(1)) : 7.0,
        language: original_language ? original_language.toUpperCase() : 'EN',
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        genres: {
          create: genreIds.map((gid) => ({
            genreId: gid,
          })),
        },
        videoSources: {
          create: [
            {
              contentType: ContentType.MOVIE,
              sourceName: `SamOnline BDIX (${quality} Dual Audio)`,
              sourceUrl: videoInfo.videoUrl,
              quality: quality,
              format: videoInfo.format,
              status: 'ACTIVE',
            },
          ],
        },
      },
    });
  }

  // 3. Upsert Top Cast
  if (credits && credits.cast && credits.cast.length > 0) {
    const topCast = credits.cast.slice(0, 5);
    for (const c of topCast) {
      try {
        let castMember = await prisma.cast.findFirst({
          where: { name: c.name },
        });

        if (!castMember) {
          castMember = await prisma.cast.create({
            data: {
              name: c.name,
              image: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null,
              biography: `Actor in ${title}`,
            },
          });
        }

        // Link cast member to movie
        const existingContentCast = await prisma.contentCast.findFirst({
          where: { castId: castMember.id, movieId: movie.id },
        });

        if (!existingContentCast) {
          await prisma.contentCast.create({
            data: {
              castId: castMember.id,
              movieId: movie.id,
              characterName: c.character || 'Cast Member',
            },
          });
        }
      } catch (err) {
        // Continue even if single cast member fails
      }
    }
  }

  return movie;
}

async function main() {
  console.log(`\n🎬 =================================================`);
  console.log(`🎬 ScreenBox SamOnline BDIX Ingestion Engine`);
  console.log(`🎬 Target: ${TARGET_COUNT} Movies from ${DIRECTORY_URL}`);
  console.log(`🎬 =================================================\n`);

  const folders = await fetchDirectoryFolders();
  let importedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < folders.length && importedCount < TARGET_COUNT; i++) {
    const folder = folders[i];
    const { cleanTitle, year, quality } = cleanFolderName(folder.name || folder.href);

    console.log(`\n[${importedCount + 1}/${TARGET_COUNT}] Scanning: "${cleanTitle}" (${year}) [${quality}]...`);

    // 1. Find video stream in folder
    const videoInfo = await findVideoInFolder(folder.href);
    if (!videoInfo) {
      console.log(`  ⏩ Skipped: No compatible video file found in folder.`);
      skippedCount++;
      continue;
    }

    // 2. Query TMDB
    const movieData = await searchTMDB(cleanTitle, year);
    if (!movieData) {
      console.log(`  ⏩ Skipped: No TMDB match found for "${cleanTitle}".`);
      skippedCount++;
      continue;
    }

    // 3. Persist to MySQL
    try {
      const movie = await importMovie(movieData, videoInfo, quality);
      importedCount++;
      console.log(`  ✅ [${importedCount}/${TARGET_COUNT}] Saved: "${movie.title}" (${movie.releaseYear}) | Rating: ${movie.rating} ⭐ | ${videoInfo.format}`);
      console.log(`     Stream: ${videoInfo.videoUrl}`);
    } catch (err) {
      console.error(`  ❌ Failed to save "${movieData.title}":`, err.message);
      skippedCount++;
    }

    // Respectful API rate limiting delay
    await sleep(150);
  }

  console.log(`\n=================================================`);
  console.log(`🎉 Ingestion Summary:`);
  console.log(`   Total Successfully Ingested: ${importedCount} Movies`);
  console.log(`   Skipped / Unmatched:         ${skippedCount} Folders`);
  console.log(`=================================================\n`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Fatal Ingestion Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
