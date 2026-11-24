/**
 * ScreenBox - Korean TV & Web Series Batch Ingestion
 * Source: http://172.16.50.14/DHAKA-FLIX-14/KOREAN%20TV%20%26%20WEB%20Series/
 * Ingests 50 Korean Drama series into MySQL with Seasons, Episodes, Video Sources, and TMDB metadata.
 */

const { PrismaClient, ContentType, ContentStatus } = require('@prisma/client');
const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY || '35710b2c7bea4a6fe3417921fbfbea58';
const BASE_HOST = 'http://172.16.50.14';
const DIR_URL = 'http://172.16.50.14/DHAKA-FLIX-14/KOREAN%20TV%20%26%20WEB%20Series/';
const TARGET_COUNT = 50;

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
  const year = yearMatch ? parseInt(yearMatch[1], 10) : 2022;

  // Extract quality
  const qualityMatch = title.match(/\b(720p|1080p|2160p|4k)\b/i);
  const quality = qualityMatch ? qualityMatch[1].toUpperCase() : '720P';

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

    // Prefer Korean language if multiple
    let selected = data.results[0];
    const koreanMatch = data.results.find((m) => m.original_language === 'ko');
    if (koreanMatch) {
      selected = koreanMatch;
    }

    const tvId = selected.id;
    const detailUrl = `https://api.themoviedb.org/3/tv/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`;
    const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(10000) });
    return await detailRes.json();
  } catch (err) {
    console.error(`  ⚠️ TMDB TV search error for "${query}":`, err.message);
    return null;
  }
}

async function importSingleSeries(folder, parsed) {
  const folderUrl = folder.href.startsWith('http') ? folder.href : `${BASE_HOST}${folder.href}`;
  const seriesContents = await fetchDirectoryLinks(folderUrl);

  // Look for folder images
  const posterFile = seriesContents.find((c) => /a_al_\.(jpe?g|png)/i.test(c.name));
  const backdropFile = seriesContents.find((c) => /a_vl_\.(jpe?g|png)/i.test(c.name));

  const folderPoster = posterFile
    ? posterFile.href.startsWith('http')
      ? posterFile.href
      : `${BASE_HOST}${posterFile.href}`
    : null;
  const folderBackdrop = backdropFile
    ? backdropFile.href.startsWith('http')
      ? backdropFile.href
      : `${BASE_HOST}${backdropFile.href}`
    : folderPoster;

  // Find seasons or direct videos
  const subdirs = seriesContents.filter(
    (c) =>
      (c.href.endsWith('/') || !c.href.includes('.')) &&
      !c.name.toLowerCase().includes('sample') &&
      !c.name.toLowerCase().includes('modern browsers') &&
      !c.name.toLowerCase().includes('powered by')
  );

  const directVideos = seriesContents.filter((c) => {
    const l = c.name.toLowerCase();
    return (l.endsWith('.mkv') || l.endsWith('.mp4') || l.endsWith('.avi')) && !l.includes('sample');
  });

  const seasonTasks = [];

  if (subdirs.length > 0) {
    // Process season subfolders
    for (const sub of subdirs) {
      const subName = sub.name;
      // Extract season number
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

  // 1. Ensure K-Drama & Korean Drama Genres exist
  const kdramaGenre = await prisma.genre.upsert({
    where: { slug: 'k-drama' },
    update: { name: 'K-Drama' },
    create: { name: 'K-Drama', slug: 'k-drama' },
  });

  const genreIds = [kdramaGenre.id];

  // Also standard TMDB genres
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
    description: tmdbData?.overview || `Watch Korean Drama ${title} with high-speed bufferless BDIX streaming.`,
    poster,
    backdrop,
    trailerUrl,
    releaseYear: year,
    rating: tmdbData?.vote_average ? parseFloat(tmdbData.vote_average.toFixed(1)) : 8.1,
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
              biography: `Actor in ${title}`,
            },
          });
        }

        const existingContentCast = await prisma.contentCast.findFirst({
          where: {
            seriesId: series.id,
            castId: castPerson.id,
          },
        });

        if (!existingContentCast) {
          await prisma.contentCast.create({
            data: {
              seriesId: series.id,
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

  // 5. Ingest Seasons & Episodes
  let totalEpisodesImported = 0;

  for (const st of seasonTasks) {
    let season = await prisma.season.findUnique({
      where: {
        seriesId_seasonNumber: {
          seriesId: series.id,
          seasonNumber: st.seasonNumber,
        },
      },
    });

    if (!season) {
      season = await prisma.season.create({
        data: {
          seriesId: series.id,
          seasonNumber: st.seasonNumber,
          title: st.title,
          description: `${st.title} of ${title}`,
          poster,
        },
      });
    }

    // Sort episode files numerically by episode number if possible
    st.epVideos.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    for (let idx = 0; idx < st.epVideos.length; idx++) {
      const epFile = st.epVideos[idx];

      // Parse episode number
      const epMatch = epFile.name.match(/\b(?:S\d+)?E(?:P)?(\d+)\b/i) || epFile.name.match(/\bEP?\.?\s*(\d+)\b/i);
      const episodeNumber = epMatch ? parseInt(epMatch[1], 10) : idx + 1;

      const epSlug = `${series.slug}-s${st.seasonNumber}-e${episodeNumber}`;
      const epTitle = `Episode ${episodeNumber}`;
      const epVideoUrl = epFile.href.startsWith('http') ? epFile.href : `${BASE_HOST}${epFile.href}`;
      const isMp4 = epFile.name.toLowerCase().endsWith('.mp4');

      let episode = await prisma.episode.findUnique({
        where: {
          seasonId_episodeNumber: {
            seasonId: season.id,
            episodeNumber,
          },
        },
      });

      if (!episode) {
        episode = await prisma.episode.create({
          data: {
            seasonId: season.id,
            episodeNumber,
            title: epTitle,
            slug: epSlug,
            description: `Watch ${epTitle} of ${title} Season ${st.seasonNumber} in HD with bufferless BDIX streaming.`,
            thumbnail: backdrop,
            runtime: 60,
            status: ContentStatus.PUBLISHED,
          },
        });
      }

      // Upsert Video Source
      const existingSource = await prisma.videoSource.findFirst({
        where: {
          episodeId: episode.id,
          sourceUrl: epVideoUrl,
        },
      });

      if (!existingSource) {
        await prisma.videoSource.create({
          data: {
            contentType: ContentType.SERIES,
            episodeId: episode.id,
            sourceName: 'Server 1',
            sourceUrl: epVideoUrl,
            quality: parsed.quality,
            format: isMp4 ? 'MP4' : 'MKV',
            status: 'ACTIVE',
          },
        });
      }

      totalEpisodesImported++;
    }
  }

  return {
    title,
    year,
    slug: series.slug,
    seasonsCount: seasonTasks.length,
    episodesCount: totalEpisodesImported,
    tmdbRating: series.rating,
  };
}

async function run() {
  console.log(`🎬 Target: Ingesting 50 Korean TV & Web Series into MySQL...`);
  console.log(`Directory: ${DIR_URL}\n`);

  const rawFolders = await fetchDirectoryLinks(DIR_URL);
  const seriesFolders = rawFolders.filter(
    (f) =>
      !f.name.toLowerCase().includes('modern browsers') &&
      !f.name.toLowerCase().includes('powered by') &&
      !f.name.toLowerCase().includes('parent directory') &&
      !f.name.includes('.')
  );

  console.log(`Found ${seriesFolders.length} valid series folders on BDIX server.`);

  let importedCount = 0;
  const importedList = [];

  for (let i = 0; i < seriesFolders.length && importedCount < TARGET_COUNT; i++) {
    const folder = seriesFolders[i];
    const parsed = parseSeriesFolder(folder.name);

    console.log(`--------------------------------------------------`);
    console.log(`[${i + 1}/${seriesFolders.length}] Checking: ${folder.name}`);
    console.log(`   Parsed: "${parsed.cleanTitle}" (${parsed.year}) [${parsed.quality}]`);

    try {
      const result = await importSingleSeries(folder, parsed);
      if (result) {
        importedCount++;
        importedList.push(result);
        console.log(
          `   ✅ [${importedCount}/${TARGET_COUNT}] Ingested: "${result.title}" (${result.year}) | ${result.seasonsCount} Season(s), ${result.episodesCount} Episodes | Rating: ${result.tmdbRating} ⭐`
        );
      }
    } catch (err) {
      console.error(`   ❌ Failed to import "${folder.name}":`, err.message);
    }

    // Gentle delay between series
    await sleep(350);
  }

  console.log(`\n==================================================`);
  console.log(`🎉 Ingestion Complete! Successfully imported ${importedList.length} Korean TV Series.`);
  console.log(`==================================================\n`);
}

run()
  .catch((e) => {
    console.error('Fatal Ingestion Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
