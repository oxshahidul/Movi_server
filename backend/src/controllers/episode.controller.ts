import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getEpisodeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const episode = await prisma.episode.findUnique({
      where: { id },
      include: {
        season: {
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
          },
        },
        videoSources: {
          where: { status: "ACTIVE" },
        },
        subtitles: true,
      },
    });

    if (!episode) {
      sendError(res, "Episode not found", 404);
      return;
    }

    let progressSeconds = 0;
    if (req.user) {
      const history = await prisma.watchHistory.findFirst({
        where: {
          userId: req.user.id,
          episodeId: episode.id,
        },
      });
      if (history) {
        progressSeconds = history.progressSeconds;
      }
    }

    sendSuccess(res, {
      ...episode,
      playbackProgress: progressSeconds,
    });
  } catch (error) {
    sendError(res, "Failed to fetch episode details", 500);
  }
};

export const getEpisodeBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const episode = await prisma.episode.findUnique({
      where: { slug },
      include: {
        season: {
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
          },
        },
        videoSources: {
          where: { status: "ACTIVE" },
        },
        subtitles: true,
      },
    });

    if (!episode) {
      sendError(res, "Episode not found", 404);
      return;
    }

    let progressSeconds = 0;
    if (req.user) {
      const history = await prisma.watchHistory.findFirst({
        where: {
          userId: req.user.id,
          episodeId: episode.id,
        },
      });
      if (history) {
        progressSeconds = history.progressSeconds;
      }
    }

    sendSuccess(res, {
      ...episode,
      playbackProgress: progressSeconds,
    });
  } catch (error) {
    sendError(res, "Failed to fetch episode details by slug", 500);
  }
};
