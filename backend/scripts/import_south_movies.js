/**
 * ScreenBox - South Indian Movie Batch Ingestion with TMDB Enrichment
 * Ingests South Indian movies from BDIX server (172.16.50.14) into MySQL via Prisma.
 */

const { PrismaClient, ContentType, ContentStatus } = require('@prisma/client');
const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY || '35710b2c7bea4a6fe3417921fbfbea58';
const BASE_HOST = 'http://172.16.50.14';
const DIRECTORIES = [
  { url: 'http://172.16.50.14/DHAKA-FLIX-14/SOUTH%20INDIAN%20MOVIES/South%20Movies/2026/', defaultYear: 2026 },
  { url: 'http://172.16.50.14/DHAKA-FLIX-14/SOUTH%20INDIAN%20MOVIES/South%20Movies/2025/', defaultYear: 2025 },
];

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

function parseFolderInfo(folderName, defaultYear) {
  let title = decodeURIComponent(folderName).replace(/\/$/, '');
  
  if (title.includes('/')) {
    const parts = title.split('/').filter(Boolean);
    title = parts[parts.length - 1];
  }

  // Detect language from folder label
  let lang = 'South Indian';
  if (/telugu/i.test(title)) lang = 'Telugu';
  else if (/tamil/i.test(title)) lang = 'Tamil';
  else if (/malayalam/i.test(title)) lang = 'Malayalam';
  else if (/kannada/i.test(title)) lang = 'Kannada';
  else if (/marathi/i.test(title)) lang = 'Marathi';
  else if (/hindi/i.test(title)) lang = 'Hindi';

  // Extract year
  const yearMatch = title.match(/\((19\d\d|20\d\d)\)/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : defaultYear;

  // Extract quality
  const qualityMatch = title.match(/\b(720p|1080p|2160p|4k)\b/i);
  const quality = qualityMatch ? qualityMatch[1].toUpperCase() : '1080P';

  // Strip brackets and metadata tags to get clean search query
  let cleanTitle = title;
  cleanTitle = cleanTitle.replace(/\((19\d\d|20\d\d)\).*/, '');
  cleanTitle = cleanTitle.replace(/\[.*?\]/g, '');
  cleanTitle = cleanTitle.replace(/\b(720p|1080p|2160p|4k|HDTC|PreHDRip|DVDScr|WEBRip|WEB-DL|BluRay|Dual Audio|Multi Audio|x264|x265|HEVC|10bit|AAC|DD5\.1|ESub|HDHub4u|HDHub|V2|UNCUT)\b/gi, '');
  cleanTitle = cleanTitle.replace(/[-_.]+/g, ' ');
  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();

  return { cleanTitle, year, quality, lang };
}

async function fetchDirectoryFolders(dirUrl) {
  console.log(`🌐 Crawling directory listing: ${dirUrl}`);
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

async function findVideoInFolder(folderHref) {
  const folderUrl = folderHref.startsWith('http') ? folderHref : `${BASE_HOST}${folderHref}`;
  const res = await fetch(folderUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(10000),
  });
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

  const videoFile = files[0];
  const videoUrl = videoFile.href.startsWith('http') ? videoFile.href : `${BASE_HOST}${videoFile.href}`;
  const isMp4 = videoFile.href.toLowerCase().endsWith('.mp4');

  return {
    videoUrl,
    fileName: videoFile.name,
    format: isMp4 ? 'MP4' : 'MKV',
  };
}

async function searchTMDB(query, year, expectedLang) {
  try {
    // Priority 1: Search with title + year
    let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&year=${year}`;
    let res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
    let data = await res.json();

    // Priority 2: If no results, retry without year restriction
    if (!data.results || data.results.length === 0) {
      searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
      res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
      data = await res.json();
    }

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Pick best match (prefer matching regional language if multiple)
    let selected = data.results[0];
    const southLangCodes = ['te', 'ta', 'ml', 'kn', 'mr', 'hi'];
    const matchingLang = data.results.find((m) => southLangCodes.includes(m.original_language));
    if (matchingLang) {
      selected = matchingLang;
    }

    const tmdbId = selected.id;

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

async function importMovie(movieData, fallbackInfo, videoInfo) {
  let title = movieData ? movieData.title : fallbackInfo.cleanTitle;
  let year = movieData?.release_date ? parseInt(movieData.release_date.slice(0, 4), 10) : fallbackInfo.year;
  let tmdbId = movieData?.id || Math.floor(Math.random() * 900000 + 100000);

  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${year}-${tmdbId}`;

  const poster = movieData?.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null;
  const backdrop = movieData?.backdrop_path ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}` : poster;

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

  // Determine language string
  let finalLanguage = fallbackInfo.lang;
  if (movieData?.original_language) {
    const langMap = {
      te: 'Telugu',
      ta: 'Tamil',
      ml: 'Malayalam',
      kn: 'Kannada',
      mr: 'Marathi',
      hi: 'Hindi',
      en: 'English',
    };
    if (langMap[movieData.original_language]) {
      finalLanguage = langMap[movieData.original_language];
    }
  }

  // 3. Upsert Movie
  let movie = await prisma.movie.findFirst({
    where: {
      OR: [{ slug }, { title, releaseYear: year }],
    },
  });

  const moviePayload = {
    title,
    slug,
    description: movieData?.overview || `Watch ${title} in HD quality with bufferless BDIX playback.`,
    poster: poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
    backdrop: backdrop || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1280&q=80',
    trailerUrl,
    releaseYear: year,
    runtime: movieData?.runtime || 135,
    rating: movieData?.vote_average ? parseFloat(movieData.vote_average.toFixed(1)) : 7.5,
    language: finalLanguage,
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

  // 5. Upsert Cast Members (Top 5)
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
        // Continue even if single cast member fails
      }
    }
  }

  // 6. Upsert Video Source as "Server 1" (No ISP or SamOnline branding)
  const existingSource = await prisma.videoSource.findFirst({
    where: {
      movieId: movie.id,
      sourceUrl: videoInfo.videoUrl,
    },
  });

  if (!existingSource) {
    await prisma.videoSource.create({
      data: {
        contentType: ContentType.MOVIE,
        movieId: movie.id,
        sourceName: 'Server 1',
        quality: fallbackInfo.quality,
        sourceUrl: videoInfo.videoUrl,
        format: videoInfo.format,
        status: 'ACTIVE',
      },
    });
  } else {
    await prisma.videoSource.update({
      where: { id: existingSource.id },
      data: {
        sourceName: 'Server 1',
        quality: fallbackInfo.quality,
      },
    });
  }

  return { title, year, lang: finalLanguage, quality: fallbackInfo.quality };
}

async function run() {
  console.log('🚀 Starting South Indian Movies Ingestion (2026 + 2025)...');
  console.log('Using TMDB API Key:', TMDB_API_KEY);

  let totalProcessed = 0;
  let totalSuccessful = 0;

  for (const dir of DIRECTORIES) {
    console.log(`\n========================================`);
    console.log(`📂 Processing Directory: ${dir.url}`);
    console.log(`========================================`);

    try {
      const folders = await fetchDirectoryFolders(dir.url);
      console.log(`Found ${folders.length} movie folders.`);

      for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        totalProcessed++;
        console.log(`\n[${totalProcessed}] Processing: ${folder.name}`);

        const parsed = parseFolderInfo(folder.name, dir.defaultYear);
        console.log(`   Cleaned Title: "${parsed.cleanTitle}" | Year: ${parsed.year} | Quality: ${parsed.quality} | Lang: ${parsed.lang}`);

        // Find video stream
        const videoInfo = await findVideoInFolder(folder.href);
        if (!videoInfo) {
          console.log(`   ⚠️ No valid video file (.mkv / .mp4) found in folder. Skipping.`);
          continue;
        }
        console.log(`   🎬 Found Video: ${videoInfo.fileName}`);

        // Search TMDB
        const tmdbData = await searchTMDB(parsed.cleanTitle, parsed.year, parsed.lang);
        if (tmdbData) {
          console.log(`   ⭐ Matched TMDB: "${tmdbData.title}" (${tmdbData.release_date || 'N/A'}) - Rating: ${tmdbData.vote_average}`);
        } else {
          console.log(`   ℹ️ No direct TMDB match. Inserting with fallback metadata.`);
        }

        // Import into MySQL
        const imported = await importMovie(tmdbData, parsed, videoInfo);
        console.log(`   ✅ Successfully saved: "${imported.title}" [${imported.lang}] (${imported.quality}) -> "Server 1"`);
        totalSuccessful++;

        // Brief delay between TMDB queries
        await sleep(350);
      }
    } catch (err) {
      console.error(`❌ Error scanning directory ${dir.url}:`, err.message);
    }
  }

  console.log('\n========================================');
  console.log(`🎉 Ingestion Complete!`);
  console.log(`Total Folders Scanned: ${totalProcessed}`);
  console.log(`Total Movies Saved to MySQL: ${totalSuccessful}`);
  console.log(`Genre Tag: 'South Indian' (slug: 'south-indian') applied to all.`);
  console.log('========================================\n');
}

run()
  .catch((e) => {
    console.error('Fatal Ingestion Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
