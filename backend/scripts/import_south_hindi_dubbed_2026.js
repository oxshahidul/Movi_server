/**
 * ScreenBox - Import 20 South Indian Movies (Hindi Dubbed - 2026)
 * Target Directory: http://172.16.50.14/DHAKA-FLIX-14/SOUTH%20INDIAN%20MOVIES/Hindi%20Dubbed/%282026%29/
 */

const { PrismaClient, ContentType, ContentStatus } = require('@prisma/client');
const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY || '35710b2c7bea4a6fe3417921fbfbea58';
const BASE_HOST = 'http://172.16.50.14';
const DIR_URL = 'http://172.16.50.14/DHAKA-FLIX-14/SOUTH%20INDIAN%20MOVIES/Hindi%20Dubbed/%282026%29/';
const TARGET_COUNT = 20;

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

function parseFolderInfo(folderName) {
  let title = decodeURIComponent(folderName).replace(/\/$/, '');
  if (title.includes('/')) {
    const parts = title.split('/').filter(Boolean);
    title = parts[parts.length - 1];
  }

  // Extract year
  const yearMatch = title.match(/\((19\d\d|20\d\d)\)/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

  // Extract quality
  const qualityMatch = title.match(/\b(720p|1080p|2160p|4k)\b/i);
  const quality = qualityMatch ? qualityMatch[1].toUpperCase() : '1080P';

  // Audio info
  let audioDesc = 'Hindi Dubbed';
  if (/dual audio/i.test(title)) audioDesc = 'Hindi Dual Audio';
  else if (/multi audio/i.test(title)) audioDesc = 'Hindi Multi Audio';

  // Clean title for search
  let cleanTitle = title;
  cleanTitle = cleanTitle.replace(/\((19\d\d|20\d\d)\).*/, '');
  cleanTitle = cleanTitle.replace(/\[.*?\]/g, '');
  cleanTitle = cleanTitle.replace(/\b(720p|1080p|2160p|4k|HDTC|PreHDRip|DVDScr|WEBRip|WEB-DL|BluRay|Dual Audio|Multi Audio|x264|x265|HEVC|10bit|AAC|DD5\.1|ESub|HDHub4u|HDHub|V2|UNCUT|DS4K)\b/gi, '');
  cleanTitle = cleanTitle.replace(/[-_.]+/g, ' ');
  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();

  return { cleanTitle, rawTitle: title, year, quality, audioDesc };
}

async function fetchDirectoryFolders(dirUrl) {
  console.log(`🌐 Crawling directory: ${dirUrl}`);
  const res = await fetch(dirUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch directory: ${res.status} ${res.statusText}`);
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
        l.name !== 'Parent Directory' &&
        l.name !== 'modern browsers' &&
        !l.name.includes('powered by') &&
        (l.href.endsWith('/') || !l.href.includes('.'))
    );

  return folders;
}

async function findFolderAssets(folderHref) {
  const folderUrl = folderHref.startsWith('http') ? folderHref : `${BASE_HOST}${folderHref}`;
  const res = await fetch(folderUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const html = await res.text();

  const linkMatches = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  const items = linkMatches
    .map((m) => ({
      href: m[1],
      name: m[2].replace(/<[^>]+>/g, '').trim(),
    }))
    .filter((f) => !f.href.startsWith('?') && !f.href.startsWith('#') && !f.href.includes('_h5ai'));

  // Find video file
  const videoFiles = items.filter((f) => {
    const lower = f.href.toLowerCase();
    return (
      (lower.endsWith('.mkv') || lower.endsWith('.mp4') || lower.endsWith('.avi') || lower.endsWith('.webm')) &&
      !lower.includes('sample')
    );
  });

  if (videoFiles.length === 0) return null;

  const videoFile = videoFiles[0];
  const videoUrl = videoFile.href.startsWith('http') ? videoFile.href : `${BASE_HOST}${videoFile.href}`;
  const isMp4 = videoFile.href.toLowerCase().endsWith('.mp4');

  // Find poster image if available in folder
  const imageFiles = items.filter((f) => {
    const lower = f.href.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png');
  });

  let folderPoster = null;
  if (imageFiles.length > 0) {
    const img = imageFiles[0];
    folderPoster = img.href.startsWith('http') ? img.href : `${BASE_HOST}${img.href}`;
  }

  return {
    videoUrl,
    fileName: videoFile.name,
    format: isMp4 ? 'MP4' : 'MKV',
    folderPoster,
  };
}

async function searchTMDB(query, year) {
  try {
    // 1. Search with title + year
    let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&year=${year}`;
    let res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
    let data = await res.json();

    // 2. If no results, retry without year
    if (!data.results || data.results.length === 0) {
      searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
      res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
      data = await res.json();
    }

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Prefer South Indian language or Hindi
    let selected = data.results[0];
    const southLangCodes = ['te', 'ta', 'ml', 'kn', 'hi'];
    const matchingLang = data.results.find((m) => southLangCodes.includes(m.original_language));
    if (matchingLang) {
      selected = matchingLang;
    }

    const tmdbId = selected.id;
    const detailUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;
    const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(10000) });
    const movieData = await detailRes.json();

    return movieData;
  } catch (err) {
    console.error(`  ⚠️ TMDB search error for "${query}":`, err.message);
    return null;
  }
}

async function importMovie(movieData, parsedInfo, assets) {
  let title = movieData ? movieData.title : parsedInfo.cleanTitle;
  let year = movieData?.release_date ? parseInt(movieData.release_date.slice(0, 4), 10) : parsedInfo.year;
  let tmdbId = movieData?.id || Math.floor(Math.random() * 900000 + 100000);

  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${year}-${tmdbId}`;

  const poster = movieData?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
    : assets.folderPoster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80';

  const backdrop = movieData?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
    : assets.folderPoster || poster;

  const trailer = movieData?.videos?.results?.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  // 1. Ensure "South Indian" Genre exists
  const southIndianGenre = await prisma.genre.upsert({
    where: { slug: 'south-indian' },
    update: { name: 'South Indian' },
    create: { name: 'South Indian', slug: 'south-indian' },
  });

  const genreIds = [southIndianGenre.id];

  // 2. Upsert standard TMDB Genres
  if (movieData?.genres && movieData.genres.length > 0) {
    for (const g of movieData.genres) {
      const gSlug = slugify(g.name);
      const genre = await prisma.genre.upsert({
        where: { slug: gSlug },
        update: { name: g.name },
        create: { name: g.name, slug: gSlug },
      });
      if (!genreIds.includes(genre.id)) {
        genreIds.push(genre.id);
      }
    }
  }

  // Language display: Hindi (Dubbed)
  const language = 'Hindi (Dubbed)';

  // 3. Upsert Movie
  let movie = await prisma.movie.findFirst({
    where: {
      OR: [{ slug }, { title, releaseYear: year }],
    },
  });

  const moviePayload = {
    title,
    slug,
    description: movieData?.overview || `Watch ${title} in Hindi Dubbed HD quality with bufferless BDIX playback.`,
    poster,
    backdrop,
    trailerUrl,
    releaseYear: year,
    runtime: movieData?.runtime || 135,
    rating: movieData?.vote_average ? parseFloat(movieData.vote_average.toFixed(1)) : 7.2,
    language,
    status: ContentStatus.PUBLISHED,
  };

  if (movie) {
    movie = await prisma.movie.update({
      where: { id: movie.id },
      data: moviePayload,
    });
  } else {
    movie = await prisma.movie.create({
      data: moviePayload,
    });
  }

  // 4. Connect Movie Genres
  for (const genreId of genreIds) {
    const existing = await prisma.movieGenre.findUnique({
      where: {
        movieId_genreId: {
          movieId: movie.id,
          genreId,
        },
      },
    });

    if (!existing) {
      await prisma.movieGenre.create({
        data: {
          movieId: movie.id,
          genreId,
        },
      });
    }
  }

  // 5. Upsert Cast Members
  if (movieData?.credits?.cast && movieData.credits.cast.length > 0) {
    const topCast = movieData.credits.cast.slice(0, 5);
    for (const c of topCast) {
      if (!c.name) continue;
      try {
        let castPerson = await prisma.cast.findFirst({
          where: { name: c.name },
        });

        if (!castPerson) {
          castPerson = await prisma.cast.create({
            data: {
              name: c.name,
              image: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
              biography: `Actor in ${title}`,
            },
          });
        }

        const existingContentCast = await prisma.contentCast.findFirst({
          where: {
            movieId: movie.id,
            castId: castPerson.id,
          },
        });

        if (!existingContentCast) {
          await prisma.contentCast.create({
            data: {
              movieId: movie.id,
              castId: castPerson.id,
              characterName: c.character || 'Actor',
            },
          });
        }
      } catch (err) {
        // continue
      }
    }
  }

  // 6. Video Source: Server 1
  const existingSource = await prisma.videoSource.findFirst({
    where: {
      movieId: movie.id,
      sourceUrl: assets.videoUrl,
    },
  });

  if (!existingSource) {
    await prisma.videoSource.create({
      data: {
        contentType: ContentType.MOVIE,
        movieId: movie.id,
        sourceName: 'Server 1',
        quality: parsedInfo.quality,
        sourceUrl: assets.videoUrl,
        format: assets.format,
        status: 'ACTIVE',
      },
    });
  } else {
    await prisma.videoSource.update({
      where: { id: existingSource.id },
      data: {
        sourceName: 'Server 1',
        quality: parsedInfo.quality,
        status: 'ACTIVE',
      },
    });
  }

  return { id: movie.id, title, year, quality: parsedInfo.quality, slug: movie.slug };
}

async function run() {
  console.log(`🎬 Target: Ingesting 20 South Indian (Hindi Dubbed - 2026) Movies into MySQL...`);
  console.log(`Directory: ${DIR_URL}`);

  const folders = await fetchDirectoryFolders(DIR_URL);
  console.log(`Found ${folders.length} available folders.\n`);

  let importedCount = 0;
  const importedList = [];

  for (let i = 0; i < folders.length && importedCount < TARGET_COUNT; i++) {
    const folder = folders[i];
    console.log(`--------------------------------------------------`);
    console.log(`Checking [${i + 1}/${folders.length}]: ${folder.name}`);

    const parsed = parseFolderInfo(folder.name);
    console.log(`  Parsed: "${parsed.cleanTitle}" (${parsed.year}) [${parsed.quality}]`);

    // Check video files inside folder
    const assets = await findFolderAssets(folder.href);
    if (!assets) {
      console.log(`  ⚠️ No valid video file found. Skipping.`);
      continue;
    }
    console.log(`  🎬 Stream file: ${assets.fileName}`);
    if (assets.folderPoster) {
      console.log(`  🖼️ Folder poster detected: ${assets.folderPoster}`);
    }

    // Search TMDB
    const tmdbData = await searchTMDB(parsed.cleanTitle, parsed.year);
    if (tmdbData) {
      console.log(`  ⭐ TMDB Matched: "${tmdbData.title}" (${tmdbData.release_date}) - Rating: ${tmdbData.vote_average}`);
    } else {
      console.log(`  ℹ️ No exact TMDB match. Using folder metadata + fallback.`);
    }

    // Import into DB
    const res = await importMovie(tmdbData, parsed, assets);
    importedCount++;
    importedList.push(res);
    console.log(`  ✅ [${importedCount}/${TARGET_COUNT}] Added to DB: "${res.title}" (${res.year})`);

    await sleep(300);
  }

  console.log(`\n==================================================`);
  console.log(`🎉 Successfully added ${importedList.length} movies to South Indian category!`);
  console.log(`==================================================`);
  importedList.forEach((m, idx) => {
    console.log(`${idx + 1}. ${m.title} (${m.year}) - Slug: ${m.slug}`);
  });
}

run()
  .catch((e) => {
    console.error('Fatal Import Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
