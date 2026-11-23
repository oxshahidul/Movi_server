/**
 * ScreenBox - Live TV Ingestion & Sync Pipeline (Option A: ~120 Curated Premium Channels)
 * Sources:
 *  - abusaeeidx/Mrgify-BDIX-IPTV (playlist.m3u & Channels_data.json)
 *  - saeidrahmanbd/BDIX-IPTV (IPTV-Playlist.m3u)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MRGIFY_M3U_URL = 'https://raw.githubusercontent.com/abusaeeidx/Mrgify-BDIX-IPTV/main/playlist.m3u';
const MRGIFY_JSON_URL = 'https://raw.githubusercontent.com/abusaeeidx/Mrgify-BDIX-IPTV/main/Channels_data.json';
const SAEID_M3U_URL = 'https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u';

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

function parseM3U(content, repoTag) {
  const lines = content.split('\n');
  const items = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      current = { sourceRepo: repoTag };
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);

      // Channel name in M3U is after the last comma
      const lastCommaIdx = line.lastIndexOf(',');
      let rawName = lastCommaIdx !== -1 ? line.substring(lastCommaIdx + 1).trim() : 'Unknown Channel';
      rawName = rawName.replace(/^["'\s]+|["'\s]+$/g, '');

      current.logo = logoMatch ? logoMatch[1].trim() : null;
      current.group = groupMatch ? groupMatch[1].trim() : 'General';
      current.name = rawName;
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (current) {
        current.url = line;
        items.push(current);
        current = null;
      }
    }
  }
  return items;
}

// Map various source group names to standardized categories
function normalizeCategory(groupName, channelName) {
  const gn = (groupName || '').toLowerCase();
  const cn = (channelName || '').toLowerCase();

  // Sports
  if (
    gn.includes('sport') ||
    gn.includes('cricket') ||
    gn.includes('football') ||
    cn.includes('sports') ||
    cn.includes('cricket') ||
    cn.includes('t sports') ||
    cn.includes('star sports') ||
    cn.includes('sony ten') ||
    cn.includes('euro sport')
  ) {
    return 'Sports';
  }

  // Bangladesh
  if (
    gn === 'bangladesh' ||
    gn === 'bangla' ||
    gn === 'akash go' ||
    cn.includes('somoy') ||
    cn.includes('jamuna') ||
    cn.includes('ekattor') ||
    cn.includes('deshi tv') ||
    cn.includes('boishakhi') ||
    cn.includes('ntv') ||
    cn.includes('rtv') ||
    cn.includes('channel i') ||
    cn.includes('atn bangla') ||
    cn.includes('independent') ||
    cn.includes('maasranga') ||
    cn.includes('deepto') ||
    cn.includes('nagorik') ||
    cn.includes('gtv') ||
    cn.includes('btv') ||
    cn.includes('ekushey')
  ) {
    return 'Bangladesh';
  }

  // Indian Bangla
  if (
    gn.includes('indian bangla') ||
    cn.includes('zee bangla') ||
    cn.includes('star jalsha') ||
    cn.includes('jalsha movies') ||
    cn.includes('colors bangla') ||
    cn.includes('sangeet bangla') ||
    cn.includes('aakaash aath')
  ) {
    return 'Indian Bangla';
  }

  // Indian Movies
  if (
    gn.includes('indian movies') ||
    cn.includes('star gold') ||
    cn.includes('sony max') ||
    cn.includes('zee cinema') ||
    cn.includes('&pictures') ||
    cn.includes('colors cineplex') ||
    cn.includes('zee bollywood') ||
    cn.includes('movies now')
  ) {
    return 'Indian Movies';
  }

  // Indian Entertainment
  if (
    gn.includes('indian entertainment') ||
    gn.includes('hindi') ||
    cn.includes('star plus') ||
    cn.includes('sony set') ||
    cn.includes('colors') ||
    cn.includes('zee tv') ||
    cn.includes('sab tv') ||
    cn.includes('star bharat') ||
    cn.includes('&tv')
  ) {
    return 'Indian Entertainment';
  }

  // Kids
  if (
    gn.includes('kid') ||
    cn.includes('cartoon network') ||
    cn.includes('pogo') ||
    cn.includes('nickelodeon') ||
    cn.includes('sonic') ||
    cn.includes('disney') ||
    cn.includes('hungama') ||
    cn.includes('duronto')
  ) {
    return 'Kids';
  }

  // Documentary & Wildlife
  if (
    gn.includes('documentary') ||
    gn.includes('wildlife') ||
    cn.includes('discovery') ||
    cn.includes('national geographic') ||
    cn.includes('nat geo') ||
    cn.includes('animal planet') ||
    cn.includes('history') ||
    cn.includes('earth')
  ) {
    return 'Documentary & Wildlife';
  }

  // News
  if (
    gn.includes('news') ||
    cn.includes('bbc news') ||
    cn.includes('cnn') ||
    cn.includes('al jazeera') ||
    cn.includes('ndtv') ||
    cn.includes('aaj tak') ||
    cn.includes('india today') ||
    cn.includes('republic') ||
    cn.includes('dw')
  ) {
    return 'News';
  }

  // Music
  if (
    gn.includes('music') ||
    cn.includes('9xm') ||
    cn.includes('mtv') ||
    cn.includes('b4u music') ||
    cn.includes('zoom')
  ) {
    return 'Music';
  }

  // Religious
  if (
    gn.includes('religio') ||
    gn.includes('islam') ||
    cn.includes('makkah') ||
    cn.includes('madinah') ||
    cn.includes('peace tv') ||
    cn.includes('quran')
  ) {
    return 'Religious';
  }

  // International
  if (gn.includes('international') || gn.includes('english')) {
    return 'International';
  }

  return 'General';
}

function cleanChannelName(rawName) {
  let name = rawName.replace(/\[LIVE\]|\[HD\]|\[BD\]|\(720p\)|\(1080p\)|\(576p\)|\(480p\)|HDTC|FHD|UHD|4K|BDIX|♛/gi, '');
  name = name.replace(/^["'\s]+|["'\s]+$/g, '');
  name = name.replace(/\s+/g, ' ').trim();
  return name;
}

async function run() {
  console.log('📡 Fetching M3U Playlists from GitHub repositories...');

  const [resMrgifyM3U, resMrgifyJson, resSaeidM3U] = await Promise.all([
    fetch(MRGIFY_M3U_URL).then((r) => r.text()),
    fetch(MRGIFY_JSON_URL)
      .then((r) => r.json())
      .catch(() => ({ channels: [] })),
    fetch(SAEID_M3U_URL).then((r) => r.text()),
  ]);

  const mrgifyChannels = parseM3U(resMrgifyM3U, 'abusaeeidx');
  const saeidChannels = parseM3U(resSaeidM3U, 'saeidrahmanbd');

  console.log(`- Mrgify channels parsed: ${mrgifyChannels.length}`);
  console.log(`- Saeid channels parsed: ${saeidChannels.length}`);

  // Also include JSON channels from Mrgify
  if (resMrgifyJson.channels && Array.isArray(resMrgifyJson.channels)) {
    resMrgifyJson.channels.forEach((c) => {
      mrgifyChannels.push({
        name: c.name,
        group: 'Bangladesh',
        url: c.url,
        logo: null,
        sourceRepo: 'abusaeeidx-json',
      });
    });
  }

  // Target high-priority curated list per category for Option A (~120 channels)
  const targetPerCategoryLimits = {
    Bangladesh: 35,
    Sports: 30,
    'Indian Bangla': 15,
    'Indian Movies': 15,
    'Indian Entertainment': 15,
    News: 15,
    Kids: 10,
    'Documentary & Wildlife': 10,
    Music: 8,
    Religious: 6,
    International: 10,
  };

  const channelMap = new Map(); // slug -> channel object
  const categoryCount = {};

  // First pass: Saeidrahman channels (has comprehensive logos & categories)
  for (const ch of saeidChannels) {
    if (!ch.url || ch.group === 'Backup' || ch.group === 'Review' || ch.group === 'New Backups') continue;

    const cleanedName = cleanChannelName(ch.name);
    if (!cleanedName || cleanedName.length < 2) continue;

    const baseSlug = slugify(cleanedName);
    const category = normalizeCategory(ch.group, cleanedName);

    // Filter out invalid/test names
    if (baseSlug.includes('test') || baseSlug.includes('welcome') || baseSlug.includes('sample')) continue;

    const currentCount = categoryCount[category] || 0;
    const limit = targetPerCategoryLimits[category] || 10;
    if (currentCount >= limit && !channelMap.has(baseSlug)) {
      continue;
    }

    if (!channelMap.has(baseSlug)) {
      categoryCount[category] = currentCount + 1;
      channelMap.set(baseSlug, {
        name: cleanedName,
        slug: baseSlug,
        category,
        streamUrl: ch.url,
        backupUrl: null,
        logo: ch.logo || null,
        sourceRepo: ch.sourceRepo,
        isFeatured: category === 'Sports' || category === 'Bangladesh',
        quality: ch.name.toLowerCase().includes('1080') ? '1080p' : 'HD',
      });
    } else {
      // Add as backup if current channel has no backup
      const existing = channelMap.get(baseSlug);
      if (!existing.backupUrl && existing.streamUrl !== ch.url) {
        existing.backupUrl = ch.url;
      }
      if (!existing.logo && ch.logo) {
        existing.logo = ch.logo;
      }
    }
  }

  // Second pass: Mrgify channels (often have faster direct tokens or valid BD streams)
  for (const ch of mrgifyChannels) {
    if (!ch.url) continue;

    const cleanedName = cleanChannelName(ch.name);
    if (!cleanedName || cleanedName.length < 2) continue;

    const baseSlug = slugify(cleanedName);
    const category = normalizeCategory(ch.group, cleanedName);

    if (baseSlug.includes('test') || baseSlug.includes('welcome') || baseSlug.includes('sample')) continue;

    if (channelMap.has(baseSlug)) {
      const existing = channelMap.get(baseSlug);
      // If existing has no backup, set Mrgify URL as backup (or swap if it's high quality)
      if (!existing.backupUrl && existing.streamUrl !== ch.url) {
        existing.backupUrl = existing.streamUrl;
        existing.streamUrl = ch.url; // Mrgify often updated daily
      }
      if (!existing.logo && ch.logo) {
        existing.logo = ch.logo;
      }
    } else {
      const currentCount = categoryCount[category] || 0;
      const limit = targetPerCategoryLimits[category] || 10;
      if (currentCount < limit) {
        categoryCount[category] = currentCount + 1;
        channelMap.set(baseSlug, {
          name: cleanedName,
          slug: baseSlug,
          category,
          streamUrl: ch.url,
          backupUrl: null,
          logo: ch.logo || null,
          sourceRepo: ch.sourceRepo,
          isFeatured: category === 'Sports' || category === 'Bangladesh',
          quality: ch.name.toLowerCase().includes('1080') ? '1080p' : 'HD',
        });
      }
    }
  }

  const finalChannels = Array.from(channelMap.values());
  console.log(`\n✅ Curated ${finalChannels.length} high-quality channels across categories:`);
  console.log(categoryCount);

  // Ingest into MySQL via Prisma
  console.log('\n💾 Upserting Live TV channels into MySQL database...');
  let savedCount = 0;

  for (let i = 0; i < finalChannels.length; i++) {
    const ch = finalChannels[i];
    await prisma.liveTvChannel.upsert({
      where: { slug: ch.slug },
      update: {
        name: ch.name,
        category: ch.category,
        streamUrl: ch.streamUrl,
        backupUrl: ch.backupUrl,
        logo: ch.logo,
        quality: ch.quality,
        status: 'ACTIVE',
        isFeatured: ch.isFeatured,
        sourceRepo: ch.sourceRepo,
        channelNumber: i + 1,
      },
      create: {
        name: ch.name,
        slug: ch.slug,
        category: ch.category,
        streamUrl: ch.streamUrl,
        backupUrl: ch.backupUrl,
        logo: ch.logo,
        quality: ch.quality,
        status: 'ACTIVE',
        isFeatured: ch.isFeatured,
        sourceRepo: ch.sourceRepo,
        channelNumber: i + 1,
      },
    });
    savedCount++;
  }

  console.log(`\n🎉 Ingestion Finished! Total Live TV channels in MySQL: ${savedCount}`);
}

run()
  .catch((e) => {
    console.error('Fatal Ingestion Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
