/**
 * ScreenBox - Deep Live TV Stream Health Audit & Dead Channel Cleanup
 * Tests master .m3u8, nested variant playlist, and first media segment (.ts/.m4s).
 * - Promotes working backupUrl if primary streamUrl is dead.
 * - Wraps valid non-CORS M3U8 streams via /api/v1/live-tv/proxy.
 * - Permanently deletes dead/unplayable channels and re-numbers remaining channels cleanly.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PROXY_BASE = process.env.LIVE_PROXY_URL || 'http://localhost:5000/api/v1/live-tv/proxy';

async function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  return fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      Origin: 'http://localhost:3000',
      Referer: 'http://localhost:3000/',
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function verifySegment(segUrl) {
  try {
    const headRes = await fetchWithTimeout(segUrl, { method: 'HEAD' }, 6000);
    if (headRes.ok) return true;
    if (headRes.status === 405 || headRes.status === 403) {
      const getRes = await fetchWithTimeout(
        segUrl,
        { method: 'GET', headers: { Range: 'bytes=0-1024' } },
        6000
      );
      return getRes.ok || getRes.status === 206;
    }
    return false;
  } catch {
    return false;
  }
}

async function testStreamDeep(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { ok: false, reason: 'Empty URL' };
  }

  // Unwrap if already proxied
  let targetUrl = rawUrl;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.pathname.includes('/live-tv/proxy') && parsed.searchParams.get('url')) {
      targetUrl = parsed.searchParams.get('url');
    }
  } catch {
    return { ok: false, reason: 'Malformed URL' };
  }

  try {
    const res = await fetchWithTimeout(targetUrl, {}, 6500);
    if (!res.ok) {
      return { ok: false, reason: `HTTP ${res.status}` };
    }

    const acao = res.headers.get('access-control-allow-origin');
    const body = await res.text();
    if (!body.includes('#EXTM3U')) {
      return { ok: false, reason: 'Not an M3U8 playlist' };
    }

    const lines = body
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));

    if (lines.length === 0) {
      return { ok: false, reason: 'Empty playlist' };
    }

    const subUrl = new URL(lines[0], targetUrl).toString();
    let segUrl = subUrl;

    if (subUrl.toLowerCase().includes('.m3u8') || subUrl.toLowerCase().includes('m3u')) {
      const res2 = await fetchWithTimeout(subUrl, {}, 6500);
      if (!res2.ok) {
        return { ok: false, reason: `Variant HTTP ${res2.status}` };
      }
      const body2 = await res2.text();
      const lines2 = body2
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));

      if (lines2.length === 0) {
        return { ok: false, reason: 'Empty variant playlist' };
      }
      segUrl = new URL(lines2[0], subUrl).toString();
    }

    const segOk = await verifySegment(segUrl);
    if (!segOk) {
      return { ok: false, reason: 'Segment unreachable / 404' };
    }

    return {
      ok: true,
      needsProxy: !acao,
      cleanUrl: targetUrl,
    };
  } catch (err) {
    return { ok: false, reason: err?.name === 'TimeoutError' ? 'Timeout' : err?.message || 'Fetch error' };
  }
}

async function main() {
  console.log('==============================================================');
  console.log('📺 Starting Live TV Deep Stream Health Audit & Dead Removal');
  console.log('==============================================================');

  const channels = await prisma.liveTvChannel.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  console.log(`Total channels before audit: ${channels.length}`);

  const concurrency = 12;
  const deadList = [];
  const rescuedProxyList = [];
  const promotedBackupList = [];
  const activeCountBefore = channels.length;

  for (let i = 0; i < channels.length; i += concurrency) {
    const batch = channels.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (ch) => {
        const primaryCheck = await testStreamDeep(ch.streamUrl);

        if (primaryCheck.ok) {
          const finalUrl = primaryCheck.needsProxy
            ? `${PROXY_BASE}?url=${encodeURIComponent(primaryCheck.cleanUrl)}`
            : primaryCheck.cleanUrl;

          if (primaryCheck.needsProxy) {
            rescuedProxyList.push(ch.name);
          }

          if (finalUrl !== ch.streamUrl || ch.status !== 'ACTIVE') {
            await prisma.liveTvChannel.update({
              where: { id: ch.id },
              data: { streamUrl: finalUrl, status: 'ACTIVE' },
            });
          }
          return;
        }

        // Primary failed -> test backupUrl if available
        if (ch.backupUrl) {
          const backupCheck = await testStreamDeep(ch.backupUrl);
          if (backupCheck.ok) {
            const finalBackupUrl = backupCheck.needsProxy
              ? `${PROXY_BASE}?url=${encodeURIComponent(backupCheck.cleanUrl)}`
              : backupCheck.cleanUrl;

            promotedBackupList.push(ch.name);
            await prisma.liveTvChannel.update({
              where: { id: ch.id },
              data: {
                streamUrl: finalBackupUrl,
                backupUrl: null,
                status: 'ACTIVE',
              },
            });
            return;
          }
        }

        // Both primary & backup failed -> permanently delete dead channel
        deadList.push({ name: ch.name, category: ch.category, reason: primaryCheck.reason });
        await prisma.liveTvChannel.delete({
          where: { id: ch.id },
        });
      })
    );
    process.stdout.write(`  Audited ${Math.min(i + concurrency, channels.length)} / ${channels.length}...\r`);
  }

  console.log('\n\n==============================================================');
  console.log(`❌ Permanently Deleted Dead Channels (${deadList.length}):`);
  for (const d of deadList) {
    console.log(`   - [${d.category}] ${d.name} (${d.reason})`);
  }

  if (promotedBackupList.length > 0) {
    console.log(`\n🔄 Promoted Backup -> Primary (${promotedBackupList.length}):`, promotedBackupList.join(', '));
  }
  if (rescuedProxyList.length > 0) {
    console.log(`\n🛡️ Routed via CORS Proxy (${rescuedProxyList.length}):`, rescuedProxyList.join(', '));
  }

  // Re-number remaining active channels sequentially 1..N
  const remaining = await prisma.liveTvChannel.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  for (let idx = 0; idx < remaining.length; idx++) {
    await prisma.liveTvChannel.update({
      where: { id: remaining[idx].id },
      data: { channelNumber: idx + 1 },
    });
  }

  console.log(`\n✅ Cleanup Complete! Active Playable Channels: ${remaining.length} (Removed ${activeCountBefore - remaining.length} dead channels)`);
  console.log('==============================================================');

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Audit failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
