import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { ContentType } from "@prisma/client";

export const getWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
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

    res.json({ success: true, data: enriched.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch watchlist" });
  }
};

export const toggleWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { contentId, contentType } = req.body;
    if (!contentId || !contentType) {
      res.status(400).json({ success: false, message: "Missing contentId or contentType" });
      return;
    }

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
      await prisma.watchlist.delete({
        where: { id: existing.id },
      });
      res.json({ success: true, isWatchlisted: false, message: "Removed from Watchlist" });
    } else {
      await prisma.watchlist.create({
        data: {
          userId: req.user.id,
          contentId,
          contentType: type,
        },
      });
      res.json({ success: true, isWatchlisted: true, message: "Added to Watchlist" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update watchlist" });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { contentId, contentType } = req.body;
    if (!contentId || !contentType) {
      res.status(400).json({ success: false, message: "Missing contentId or contentType" });
      return;
    }

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
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      res.json({ success: true, isFavorite: false, message: "Removed from Favorites" });
    } else {
      await prisma.favorite.create({
        data: {
          userId: req.user.id,
          contentId,
          contentType: type,
        },
      });
      res.json({ success: true, isFavorite: true, message: "Added to Favorites" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update favorites" });
  }
};

export const submitRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { contentId, contentType, rating } = req.body;
    const numRating = parseInt(rating, 10);

    if (!contentId || !contentType || isNaN(numRating) || numRating < 1 || numRating > 10) {
      res.status(400).json({ success: false, message: "Rating must be an integer between 1 and 10" });
      return;
    }

    const type = contentType === "SERIES" ? ContentType.SERIES : ContentType.MOVIE;

    const userRating = await prisma.rating.upsert({
      where: {
        userId_contentId: {
          userId: req.user.id,
          contentId,
        },
      },
      update: { rating: numRating },
      create: {
        userId: req.user.id,
        contentId,
        contentType: type,
        rating: numRating,
      },
    });

    // Recalculate average rating for the title
    const allRatings = await prisma.rating.findMany({
      where: { contentId },
      select: { rating: true },
    });

    const averageRating = (
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
    ).toFixed(1);

    if (type === ContentType.MOVIE) {
      await prisma.movie.update({
        where: { id: contentId },
        data: { rating: parseFloat(averageRating) },
      });
    } else {
      await prisma.series.update({
        where: { id: contentId },
        data: { rating: parseFloat(averageRating) },
      });
    }

    res.json({
      success: true,
      message: `Rated ${numRating} / 10 successfully`,
      data: { userRating: userRating.rating, averageRating },
    });
  } catch (error) {
    console.error("submitRating error:", error);
    res.status(500).json({ success: false, message: "Failed to submit rating" });
  }
};
