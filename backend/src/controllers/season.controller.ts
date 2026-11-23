import { Request, Response } from "express";
import prisma from "../prisma/client";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getSeasonById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const season = await prisma.season.findUnique({
      where: { id },
      include: {
        series: {
          select: {
            id: true,
            title: true,
            slug: true,
            poster: true,
            backdrop: true,
          },
        },
        episodes: {
          where: { status: "PUBLISHED" },
          orderBy: { episodeNumber: "asc" },
          include: {
            videoSources: {
              where: { status: "ACTIVE" },
            },
            subtitles: true,
          },
        },
      },
    });

    if (!season) {
      sendError(res, "Season not found", 404);
      return;
    }

    sendSuccess(res, season);
  } catch (error) {
    sendError(res, "Failed to fetch season details", 500);
  }
};
