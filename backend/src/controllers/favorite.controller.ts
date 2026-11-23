import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { ContentType } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const items = await prisma.favorite.findMany({
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
    sendError(res, "Failed to fetch favorites", 500);
  }
};

export const addToFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { contentId, contentType } = req.body;
    const type = contentType === "SERIES" ? ContentType.SERIES : ContentType.MOVIE;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_contentId: {
          userId: req.user.id,
          contentId,
        },
      },
    });

    if (existing) {
      sendSuccess(res, { isFavorite: true, entry: existing }, "Item is already in favorites");
      return;
    }

    const entry = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        contentId,
        contentType: type,
      },
    });

    sendSuccess(res, { isFavorite: true, entry }, "Added to favorites", 201);
  } catch (error) {
    sendError(res, "Failed to add to favorites", 500);
  }
};

export const removeFromFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { contentId } = req.params;

    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        contentId,
      },
    });

    sendSuccess(res, { isFavorite: false }, "Removed from favorites");
  } catch (error) {
    sendError(res, "Failed to remove from favorites", 500);
  }
};
