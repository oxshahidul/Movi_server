/**
 * ScreenBox - Dhaka-Flix TV & WEB Series Batch Ingestion
 * Source: http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/
 * Ingests TV & Web Series into MySQL with Seasons, Episodes, Video Sources, and TMDB metadata.
 */

const { PrismaClient, ContentType, ContentStatus } = require('@prisma/client');
const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY || '35710b2c7bea4a6fe3417921fbfbea58';
const BASE_HOST = 'http://172.16.50.12';

const FOLDER_PARTITIONS = [
  { name: '0-9', url: 'http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%98%85%20%200%20%20%E2%80%94%20%209/' },
  { name: 'A-L', url: 'http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A5%20%20A%20%20%E2%80%94%20%20L/' },
  { name: 'M-R', url: 'http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A6%20%20M%20%20%E2%80%94%20%20R/' },
  { name: 'S-Z', url: 'http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A6%20%20S%20%20%E2%80%94%20%20Z/' },
];

// Curated high-priority flagship series to prioritize if present
const POPULAR_SERIES_PRIORITY = [
  'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'Chernobyl', 'House of the Dragon',
  'The Boys', 'The Last of Us', 'Peaky Blinders', 'Loki', 'Dark', 'Money Heist', 'Sherlock',
  'Better Call Saul', 'True Detective', 'Fargo', 'Succession', 'Vikings', 'The Witcher',
  'Severance', 'Shogun', 'Fallout', 'Friends', 'Suits', 'Prison Break', '3 Body Problem',
  '1899', '11.22.63', '1883', '1923', '13 Reasons Why', 'Dexter', 'Westworld',
  'Band of Brothers', 'The Sopranos', 'The Wire', 'Narcos', 'Mindhunter', 'Black Mirror',
  'The Mandalorian', 'FleaBag', 'Arcane', 'Daredevil', 'The Punisher', 'Wednesday',
  'Reacher', 'The Bear', 'Squid Game', 'Ted Lasso', 'Euphoria', 'Yellowstone',
  'Mayor of Kingstown', 'Tulsa King', 'Silo', 'From', 'Invincible', 'The Penguin'
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

function parseSeriesFolder(folderName) {
  let title = decodeURIComponent(folderName).replace(/\/$/, '');
  if (title.includes('/')) {
    const parts = title.split('/').filter(Boolean);
    title = parts[parts.length - 1];
  }

  // Extract year
  const yearMatch = title.match(/\((?:TV (?:Mini )?Series )?(\d{4})(?:[\u2013\u2014\-]\s*\d{0,4})?\)/i);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

  // Extract quality
  const qualityMatch = title.match(/\b(720p|1080p|2160p|4k)\b/i);
  const quality = qualityMatch ? qualityMatch[1].toUpperCase() : '1080P';

  // Clean title
  let cleanTitle = title;
  cleanTitle = cleanTitle.replace(/\((?:TV (?:Mini )?Series )?\d{4}(?:[\u2013\u2014\-]\s*\d{0,4})?\).*/i, '');
  cleanTitle = cleanTitle.replace(/\[.*?\]/g, '');
  cleanTitle = cleanTitle.replace(/\b(720p|1080p|2160p|4k|HDTC|PreHDRip|DVDScr|WEBRip|WEB-DL|BluRay|Dual Audio|Multi Audio|x264|x265|HEVC|10bit|AAC|DD5\.1|ESub|HDHub4u|HDHub|V2|UNCUT|DS4K)\b/gi, '');
  cleanTitle = cleanTitle.replace(/[-_.]+/g, ' ');
  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();

  return { cleanTitle, year, quality, rawTitle: title };
}

async function fetchDirectoryLinks(url) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_HOST}${url}`;
  try {
    const res = await fetch(fullUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    const linkMatches = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    return linkMatches
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
          !l.name.includes('powered by')
      );
  } catch (err) {
    console.error(`  [WARN] Failed to fetch directory: ${fullUrl} - ${err.message}`);
    return [];
  }
}

async function searchTMDB(query, year) {
  try {
    // 1. Search TV with query + first_air_date_year
    let searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&first_air_date_year=${year}`;
    let res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
    let data = await res.json();

    // 2. If no result, search without year
    if (!data.results || data.results.length === 0) {
      searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
      res = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) });
      data = await res.json();
    }

    if (!data.results || data.results.length === 0) {
      return null;
    }

    let selected = data.results[0];

    // Get detailed TV info with credits
    const detailUrl = `https://api.themoviedb.org/3/tv/${selected.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;
    const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(10000) });
    if (detailRes.ok) {
      const detailData = await detailRes.json();
      return detailData;
    }

    return selected;
  } catch (err) {
    return null;
  }
}

async function processSeriesFolder(seriesItem, partitionUrl) {
  const parsed = parseSeriesFolder(seriesItem.name);
  console.log(`\n======================================================`);
  console.log(`🎬 Processing: "${parsed.cleanTitle}" (${parsed.year}) [${parsed.quality}]`);

  const seriesFolderUrl = seriesItem.href.startsWith('http')
    ? seriesItem.href
    : `${BASE_HOST}${seriesItem.href}`;

  const filesInSeries = await fetchDirectoryLinks(seriesFolderUrl);

  // Look for folder images
  const imageFiles = filesInSeries.filter((f) => {
    const l = f.name.toLowerCase();
    return l.endsWith('.jpg') || l.endsWith('.png') || l.endsWith('.jpeg') || l.endsWith('.webp');
  });

  let folderPoster = null;
  let folderBackdrop = null;
  if (imageFiles.length > 0) {
    const primaryPoster = imageFiles.find((f) => f.name.includes('_AL_') || f.name.toLowerCase().includes('poster')) || imageFiles[0];
    const primaryBackdrop = imageFiles.find((f) => f.name.includes('_VL_') || f.name.toLowerCase().includes('fanart') || f.name.toLowerCase().includes('backdrop')) || imageFiles[imageFiles.length - 1];
    
    folderPoster = primaryPoster ? (primaryPoster.href.startsWith('http') ? primaryPoster.href : `${BASE_HOST}${primaryPoster.href}`) : null;
    folderBackdrop = primaryBackdrop ? (primaryBackdrop.href.startsWith('http') ? primaryBackdrop.href : `${BASE_HOST}${primaryBackdrop.href}`) : folderPoster;
  }

  // Detect seasons or video files
  const subdirs = filesInSeries.filter((f) => f.href.endsWith('/') && !f.name.match(/\.(jpg|png|jpeg|mkv|mp4|avi|txt|nfo|srt)$/i));
  const directVideos = filesInSeries.filter((f) => {
    const l = f.name.toLowerCase();
    return (l.endsWith('.mkv') || l.endsWith('.mp4') || l.endsWith('.avi')) && !l.includes('sample');
  });

  const seasonTasks = [];

  if (subdirs.length > 0) {
    // Process season subfolders
    for (const sub of subdirs) {
      const subName = sub.name;
      const seasonMatch = subName.match(/Season\s*(\d+)/i) || subName.match(/\bS(\d+)\b/i);
      const seasonNumber = seasonMatch ? parseInt(seasonMatch[1], 10) : 1;

      const seasonUrl = sub.href.startsWith('http') ? sub.href : `${BASE_HOST}${sub.href}`;
      const seasonFiles = await fetchDirectoryLinks(seasonUrl);

      const epVideos = seasonFiles.filter((c) => {
        const l = c.name.toLowerCase();
        return (l.endsWith('.mkv') || l.endsWith('.mp4') || l.endsWith('.avi')) && !l.includes('sample');
      });

      if (epVideos.length > 0) {
        seasonTasks.push({
          seasonNumber,
          title: `Season ${seasonNumber}`,
          epVideos,
        });
      }
    }
  }

  // If no season subfolders with videos, check direct videos
  if (seasonTasks.length === 0 && directVideos.length > 0) {
    seasonTasks.push({
      seasonNumber: 1,
      title: 'Season 1',
      epVideos: directVideos,
    });
  }

  if (seasonTasks.length === 0) {
    console.log(`  ⚠️ No playable video episodes found in folder. Skipping.`);
    return null;
  }

  // Search TMDB
  const tmdbData = await searchTMDB(parsed.cleanTitle, parsed.year);

  const title = tmdbData?.name || parsed.cleanTitle;
  const year = tmdbData?.first_air_date ? parseInt(tmdbData.first_air_date.slice(0, 4), 10) : parsed.year;
  const tmdbId = tmdbData?.id || Math.floor(Math.random() * 900000 + 100000);
  const slug = `${slugify(title)}-${year}-${tmdbId}`;

  const poster = tmdbData?.poster_path
    ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
    : folderPoster || 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&q=80';

  const backdrop = tmdbData?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}`
    : folderBackdrop || poster;

  const trailer = tmdbData?.videos?.results?.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  // 1. Ensure "TV & WEB Series" Genre exists (ID 25)
  const tvSeriesGenre = await prisma.genre.upsert({
    where: { slug: 'tv-web-series' },
    update: { name: 'TV & WEB Series' },
    create: { name: 'TV & WEB Series', slug: 'tv-web-series' },
  });

  const genreIds = [tvSeriesGenre.id];

  // Also attach standard TMDB genres (Drama, Action, Sci-Fi, etc.)
  if (tmdbData?.genres && tmdbData.genres.length > 0) {
    for (const g of tmdbData.genres) {
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

  // 2. Upsert Series
  let series = await prisma.series.findFirst({
    where: {
      OR: [{ slug }, { title, releaseYear: year }],
    },
  });

  const seriesPayload = {
    title,
    slug,
    description: tmdbData?.overview || `Watch ${title} (${year}) with high-speed bufferless BDIX streaming on ScreenBox.`,
    poster,
    backdrop,
    trailerUrl,
    releaseYear: year,
    rating: tmdbData?.vote_average ? parseFloat(tmdbData.vote_average.toFixed(1)) : 8.2,
    status: ContentStatus.PUBLISHED,
  };

  if (series) {
    series = await prisma.series.update({
      where: { id: series.id },
      data: seriesPayload,
    });
  } else {
    series = await prisma.series.create({
      data: seriesPayload,
    });
  }

  // 3. Connect Series Genres
  for (const genreId of genreIds) {
    const existing = await prisma.seriesGenre.findUnique({
      where: {
        seriesId_genreId: {
          seriesId: series.id,
          genreId,
        },
      },
    });

    if (!existing) {
      await prisma.seriesGenre.create({
        data: {
          seriesId: series.id,
          genreId,
        },
      });
    }
  }

  // 4. Connect Cast Members
  if (tmdbData?.credits?.cast && tmdbData.credits.cast.length > 0) {
    const topCast = tmdbData.credits.cast.slice(0, 5);
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
            },
          });
        }

        const existingRole = await prisma.contentCast.findFirst({
          where: {
            seriesId: series.id,
            castId: castPerson.id,
          },
        });

        if (!existingRole) {
          await prisma.contentCast.create({
            data: {
              seriesId: series.id,
              castId: castPerson.id,
              characterName: c.character || 'Cast Member',
            },
          });
        }
      } catch (castErr) {
        // Skip cast error gracefully
      }
    }
  }

  // 5. Ingest Seasons & Episodes
  let totalEpisodesCreated = 0;

  for (const seasonTask of seasonTasks) {
    let season = await prisma.season.findUnique({
      where: {
        seriesId_seasonNumber: {
          seriesId: series.id,
          seasonNumber: seasonTask.seasonNumber,
        },
      },
    });

    if (!season) {
      season = await prisma.season.create({
        data: {
          seriesId: series.id,
          seasonNumber: seasonTask.seasonNumber,
          title: seasonTask.title,
          poster: folderPoster || poster,
        },
      });
    }

    // Process episode video files
    // Sort videos naturally by name
    const sortedEpVideos = [...seasonTask.epVideos].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    let epIndex = 1;
    for (const epVid of sortedEpVideos) {
      // Extract episode number
      const epMatch =
        epVid.name.match(/S\d+E(\d+)/i) ||
        epVid.name.match(/\bEP?\.?\s*(\d+)\b/i) ||
        epVid.name.match(/Episode\s*(\d+)/i) ||
        epVid.name.match(/\bE(\d+)\b/i);

      const epNumber = epMatch ? parseInt(epMatch[1], 10) : epIndex;
      epIndex++;

      const epTitle = `Episode ${epNumber}`;
      const epSlug = `${series.slug}-s${seasonTask.seasonNumber}-e${epNumber}`;

      let episode = await prisma.episode.findFirst({
        where: {
          seasonId: season.id,
          episodeNumber: epNumber,
        },
      });

      if (!episode) {
        episode = await prisma.episode.create({
          data: {
            seasonId: season.id,
            title: epTitle,
            slug: epSlug,
            episodeNumber: epNumber,
            description: `${title} Season ${seasonTask.seasonNumber} Episode ${epNumber}. High definition streaming source on Dhaka-Flix BDIX.`,
            thumbnail: folderBackdrop || backdrop,
            runtime: 45,
            status: ContentStatus.PUBLISHED,
          },
        });
      }

      // Add VideoSource
      const videoSourceUrl = epVid.href.startsWith('http') ? epVid.href : `${BASE_HOST}${epVid.href}`;

      const existingSource = await prisma.videoSource.findFirst({
        where: {
          episodeId: episode.id,
          sourceUrl: videoSourceUrl,
        },
      });

      if (!existingSource) {
        await prisma.videoSource.create({
          data: {
            contentType: ContentType.SERIES,
            episodeId: episode.id,
            sourceName: 'Dhaka-Flix 1080p BDIX',
            sourceUrl: videoSourceUrl,
            quality: parsed.quality,
            format: 'MP4',
            status: 'ACTIVE',
          },
        });
      }

      totalEpisodesCreated++;
    }
  }

  console.log(`  ✅ Successfully saved series "${title}" with ${seasonTasks.length} Season(s) and ${totalEpisodesCreated} Episode(s)!`);
  return series;
}

async function main() {
  console.log(`================================================================`);
  console.log(`🚀 Starting Dhaka-Flix TV & WEB Series Batch Ingestion`);
  console.log(`📍 Base Server: ${BASE_HOST}`);
  console.log(`================================================================`);

  // Parse CLI args
  const args = process.argv.slice(2);
  let limitArg = 60;
  let isAll = false;

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      limitArg = parseInt(arg.split('=')[1], 10) || 60;
    } else if (arg === '--all') {
      isAll = true;
    }
  }

  console.log(`📌 Ingestion Target: ${isAll ? 'ALL Available Series' : `${limitArg} Series`}`);

  // 1. Gather all series folder candidates across partitions
  const allCandidates = [];

  for (const partition of FOLDER_PARTITIONS) {
    console.log(`🔍 Scanning Partition [${partition.name}]: ${partition.url}...`);
    const items = await fetchDirectoryLinks(partition.url);
    const seriesFolders = items.filter((it) => it.href.endsWith('/'));
    console.log(`   Found ${seriesFolders.length} series folders in [${partition.name}]`);

    for (const sf of seriesFolders) {
      allCandidates.push({
        ...sf,
        partitionName: partition.name,
        partitionUrl: partition.url,
      });
    }
  }

  console.log(`\n📦 Total Series Folders Discovered across server: ${allCandidates.length}`);

  // 2. Prioritize: Place popular priority series first, then remaining
  const prioritized = [];
  const remaining = [];

  for (const candidate of allCandidates) {
    const isPriority = POPULAR_SERIES_PRIORITY.some((pop) =>
      candidate.name.toLowerCase().includes(pop.toLowerCase())
    );
    if (isPriority) {
      prioritized.push(candidate);
    } else {
      remaining.push(candidate);
    }
  }

  console.log(`⭐ Prioritized Flagship Series Found: ${prioritized.length}`);

  const targetList = isAll
    ? [...prioritized, ...remaining]
    : [...prioritized, ...remaining].slice(0, limitArg);

  console.log(`🎯 Executing Ingestion for ${targetList.length} Series...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < targetList.length; i++) {
    const item = targetList[i];
    console.log(`[${i + 1}/${targetList.length}] Initiating "${item.name}"...`);
    try {
      const res = await processSeriesFolder(item, item.partitionUrl);
      if (res) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      console.error(`  ❌ Error processing "${item.name}":`, err.message);
      failCount++;
    }

    // Small courteous pause between items
    await sleep(400);
  }

  console.log(`\n================================================================`);
  console.log(`🏁 Ingestion Finished!`);
  console.log(`   Total Processed: ${targetList.length}`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed / Skipped: ${failCount}`);
  console.log(`================================================================`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Fatal Ingestion Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
