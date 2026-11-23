import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { ContentType } from "@prisma/client";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getContentRatings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contentType, contentId } = req.params;
    const type = contentType.toUpperCase() === "SERIES" ? ContentType.SERIES : ContentType.MOVIE;

    const allRatings = await prisma.rating.findMany({
      where: { contentId, contentType: type },
      select: { rating: true },
    });

    const totalRatings = allRatings.length;
    const averageRating =
      totalRatings > 0
        ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
        : "0.0";

    let userRating = null;
    if (req.user) {
      const existing = await prisma.rating.findUnique({
        where: {
          userId_contentId: {
            userId: req.user.id,
            contentId,
          },
        },
      });
      if (existing) {
        userRating = existing.rating;
      }
    }

    sendSuccess(res, {
      contentId,
      contentType: type,
      totalRatings,
      averageRating: parseFloat(averageRating),
      userRating,
    });
  } catch (error) {
    sendError(res, "Failed to fetch ratings", 500);
  }
};

export const postRating = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { contentId, contentType, rating } = req.body;
    const type = contentType === "SERIES" ? ContentType.SERIES : ContentType.MOVIE;
    const numRating = parseInt(rating, 10);

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

    sendSuccess(
      res,
      { userRating: userRating.rating, averageRating: parseFloat(averageRating) },
      `Rated ${numRating} / 10 successfully`
    );
  } catch (error) {
    sendError(res, "Failed to submit rating", 500);
  }
};
