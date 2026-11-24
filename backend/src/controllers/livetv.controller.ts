import { Request, Response } from "express";
import { Readable } from "stream";
import prisma from "../prisma/client";
import { sendSuccess, sendError } from "../utils/apiResponse";

let cachedAllowedHosts: { hosts: Set<string>; expiresAt: number } = {
  hosts: new Set(),
  expiresAt: 0,
};

async function getAllowedStreamHosts(): Promise<Set<string>> {
  if (Date.now() < cachedAllowedHosts.expiresAt) {
    return cachedAllowedHosts.hosts;
  }
  const channels = await prisma.liveTvChannel.findMany({
    where: { status: "ACTIVE" },
    select: { streamUrl: true, backupUrl: true },
  });
  const hosts = new Set<string>();
  for (const c of channels) {
    for (const raw of [c.streamUrl, c.backupUrl]) {
      if (!raw) continue;
      try {
        const u = new URL(raw);
        if (u.pathname.includes("/live-tv/proxy")) {
          const inner = u.searchParams.get("url");
          if (inner) hosts.add(new URL(inner).host);
        } else {
          hosts.add(u.host);
        }
      } catch {
        // skip invalid urls
      }
    }
  }
  cachedAllowedHosts = { hosts, expiresAt: Date.now() + 60_000 };
  return hosts;
}

export const getLiveChannels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, featured, page, limit } = req.query;

    const whereClause: any = {
      status: "ACTIVE",
    };

    if (category && typeof category === "string" && category !== "All") {
      whereClause.category = category;
    }

    if (featured === "true") {
      whereClause.isFeatured = true;
    }

    if (search && typeof search === "string" && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim() } },
        { category: { contains: search.trim() } },
      ];
    }

    const take = limit ? parseInt(limit as string, 10) : undefined;
    const skip = page && take ? (parseInt(page as string, 10) - 1) * take : undefined;

    const [channels, total] = await Promise.all([
      prisma.liveTvChannel.findMany({
        where: whereClause,
        orderBy: [{ channelNumber: "asc" }, { name: "asc" }],
        take,
        skip,
      }),
      prisma.liveTvChannel.count({ where: whereClause }),
    ]);

    sendSuccess(res, {
      channels,
      total,
      page: page ? parseInt(page as string, 10) : 1,
      limit: take || total,
    });
  } catch (error: any) {
    console.error("Failed to fetch live channels:", error);
    sendError(res, "Failed to fetch live channels", 500);
  }
};

export const getLiveCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rawCategories = await prisma.liveTvChannel.groupBy({
      by: ["category"],
      where: { status: "ACTIVE" },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    const categories = rawCategories.map((c) => ({
      name: c.category,
      count: c._count.id,
    }));

    sendSuccess(res, categories);
  } catch (error: any) {
    console.error("Failed to fetch live categories:", error);
    sendError(res, "Failed to fetch live categories", 500);
  }
};

export const getFeaturedChannels = async (_req: Request, res: Response): Promise<void> => {
  try {
    const channels = await prisma.liveTvChannel.findMany({
      where: {
        status: "ACTIVE",
        isFeatured: true,
      },
      orderBy: { channelNumber: "asc" },
      take: 16,
    });

    sendSuccess(res, channels);
  } catch (error: any) {
    console.error("Failed to fetch featured channels:", error);
    sendError(res, "Failed to fetch featured channels", 500);
  }
};

export const getChannelBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const channel = await prisma.liveTvChannel.findUnique({
      where: { slug },
    });

    if (!channel) {
      sendError(res, "Channel not found", 404);
      return;
    }

    // Related channels in same category
    const related = await prisma.liveTvChannel.findMany({
      where: {
        category: channel.category,
        status: "ACTIVE",
        id: { not: channel.id },
      },
      take: 10,
    });

    sendSuccess(res, { channel, related });
  } catch (error: any) {
    console.error("Failed to fetch channel details:", error);
    sendError(res, "Failed to fetch channel details", 500);
  }
};

/**
 * Lightweight HLS CORS Proxy for valid streams whose servers omit Access-Control-Allow-Origin.
 * Restricted strictly to hosts belonging to ACTIVE liveTvChannel rows in database.
 */
export const proxyLiveStream = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl) {
      res.status(400).send("Missing url parameter");
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      res.status(400).send("Invalid url parameter");
      return;
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      res.status(400).send("Unsupported protocol");
      return;
    }

    const allowedHosts = await getAllowedStreamHosts();
    if (!allowedHosts.has(parsedUrl.host)) {
      res.status(403).send("Host not in active channel allowlist");
      return;
    }

    const upstream = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "*/*",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok || !upstream.body) {
      res.status(upstream.status || 502).send("Upstream stream error");
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cache-Control", "no-cache");

    const contentType = (upstream.headers.get("content-type") || "").toLowerCase();
    const isPlaylist =
      parsedUrl.pathname.toLowerCase().includes(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("x-mpegurl");

    if (isPlaylist) {
      const playlistText = await upstream.text();
      const proxyBase = `${req.protocol}://${req.get("host")}/api/v1/live-tv/proxy`;

      const rewritten = playlistText
        .split(/\r?\n/)
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return line;

          if (trimmed.startsWith("#")) {
            // Rewrite URI="..." inside #EXT-X-KEY or #EXT-X-MEDIA
            return line.replace(/URI="([^"]+)"/gi, (_match, uriVal) => {
              try {
                const absUri = new URL(uriVal, parsedUrl.toString()).toString();
                return `URI="${proxyBase}?url=${encodeURIComponent(absUri)}"`;
              } catch {
                return `URI="${uriVal}"`;
              }
            });
          }

          try {
            const absUrl = new URL(trimmed, parsedUrl.toString()).toString();
            return `${proxyBase}?url=${encodeURIComponent(absUrl)}`;
          } catch {
            return line;
          }
        })
        .join("\n");

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.status(200).send(rewritten);
      return;
    }

    res.setHeader("Content-Type", contentType || "video/mp2t");
    Readable.fromWeb(upstream.body as any).pipe(res);
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(504).send("Stream proxy timeout or unreachable");
    }
  }
};
