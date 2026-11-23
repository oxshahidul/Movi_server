import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { ContentType } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const items = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    const enriched = await Promise.all(
      items.map(async (item) => {
        if (item.contentType === ContentType.MOVIE) {
          const movie = await prisma.movie.findUnique({
            where: { id: item.contentId },
            include: {
              genres: { include: { genre: true } },
            },
          });
          if (!movie) return null;
          return {
            ...item,
            media: {
              ...movie,
              type: "movie",
              genres: movie.genres.map((g) => g.genre),
            },
          };
        } else {
          const series = await prisma.series.findUnique({
            where: { id: item.contentId },
            include: {
              genres: { include: { genre: true } },
            },
          });
          if (!series) return null;
          return {
            ...item,
            media: {
              ...series,
              type: "series",
              genres: series.genres.map((g) => g.genre),
            },
          };
        }
      })
    );

    sendSuccess(res, enriched.filter(Boolean));
  } catch (error) {
    sendError(res, "Failed to fetch watchlist", 500);
  }
};

export const addToWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { contentId, contentType } = req.body;
    const type = contentType === "SERIES" ? ContentType.SERIES : ContentType.MOVIE;

    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_contentId: {
          userId: req.user.id,
          contentId,
        },
      },
    });

    if (existing) {
      sendSuccess(res, { isWatchlisted: true, entry: existing }, "Item is already in watchlist");
      return;
    }

    const entry = await prisma.watchlist.create({
      data: {
        userId: req.user.id,
        contentId,
        contentType: type,
      },
    });

    sendSuccess(res, { isWatchlisted: true, entry }, "Added to watchlist", 201);
  } catch (error) {
    sendError(res, "Failed to add to watchlist", 500);
  }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { contentId } = req.params;

    await prisma.watchlist.deleteMany({
      where: {
        userId: req.user.id,
        contentId,
      },
    });

    sendSuccess(res, { isWatchlisted: false }, "Removed from watchlist");
  } catch (error) {
    sendError(res, "Failed to remove from watchlist", 500);
  }
};
