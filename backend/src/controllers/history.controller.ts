import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { ContentType } from "@prisma/client";

export const recordProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { contentType, contentId, episodeId, progressSeconds, durationSeconds } = req.body;

    if (!contentType || !contentId || progressSeconds === undefined) {
      res.status(400).json({ success: false, message: "Missing required playback parameters" });
      return;
    }

    const type = contentType === "SERIES" ? ContentType.SERIES : ContentType.MOVIE;
    const epId = episodeId || "";

    const history = await prisma.watchHistory.upsert({
      where: {
        userId_contentId_episodeId: {
          userId: req.user.id,
          contentId,
          episodeId: epId,
        },
      },
      update: {
        progressSeconds: Math.floor(progressSeconds),
        durationSeconds: Math.floor(durationSeconds || 0),
        lastWatchedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        contentType: type,
        contentId,
        episodeId: epId,
        progressSeconds: Math.floor(progressSeconds),
        durationSeconds: Math.floor(durationSeconds || 0),
      },
    });

    res.json({ success: true, data: history });
  } catch (error) {
    console.error("recordProgress error:", error);
    res.status(500).json({ success: false, message: "Failed to record playback progress" });
  }
};

export const getContinueWatching = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.json({ success: true, data: [] });
      return;
    }

    const historyItems = await prisma.watchHistory.findMany({
      where: {
        userId: req.user.id,
        progressSeconds: { gt: 10 },
      },
      orderBy: { lastWatchedAt: "desc" },
      take: 12,
    });

    // Enrich with media details
    const enriched = await Promise.all(
      historyItems.map(async (item) => {
        if (item.contentType === ContentType.MOVIE) {
          const movie = await prisma.movie.findUnique({
            where: { id: item.contentId },
            select: { id: true, title: true, slug: true, poster: true, backdrop: true, runtime: true },
          });
          if (!movie) return null;
          return {
            ...item,
            media: {
              ...movie,
              type: "movie",
            },
          };
        } else {
          const series = await prisma.series.findUnique({
            where: { id: item.contentId },
            select: { id: true, title: true, slug: true, poster: true, backdrop: true },
          });
          const episode = item.episodeId
            ? await prisma.episode.findUnique({
                where: { id: item.episodeId },
                select: { id: true, title: true, slug: true, episodeNumber: true, thumbnail: true },
              })
            : null;

          if (!series) return null;
          return {
            ...item,
            media: {
              ...series,
              type: "series",
              episode,
            },
          };
        }
      })
    );

    res.json({ success: true, data: enriched.filter(Boolean) });
  } catch (error) {
    console.error("getContinueWatching error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch continue watching feed" });
  }
};

export const deleteHistoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { id } = req.params;
    await prisma.watchHistory.deleteMany({
      where: { id, userId: req.user.id },
    });

    res.json({ success: true, message: "History item removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete history item" });
  }
};
