import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { ContentStatus, ContentType } from "@prisma/client";

export const getSeries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 16;
    const categorySlug = (req.query.category || req.query.genre) as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {
      status: ContentStatus.PUBLISHED,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (categorySlug && categorySlug !== "all") {
      where.genres = {
        some: {
          genre: {
            slug: categorySlug,
          },
        },
      };
    }

    const [seriesList, total] = await Promise.all([
      prisma.series.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
          seasons: {
            select: {
              id: true,
              seasonNumber: true,
            },
          },
        },
      }),
      prisma.series.count({ where }),
    ]);

    const formatted = seriesList.map((s) => ({
      ...s,
      genres: s.genres.map((g) => g.genre),
      totalSeasons: s.seasons.length,
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch series list" });
  }
};

export const getSeriesBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const series = await prisma.series.findUnique({
      where: { slug },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
        cast: {
          include: {
            cast: true,
          },
        },
        seasons: {
          orderBy: { seasonNumber: "asc" },
          include: {
            episodes: {
              orderBy: { episodeNumber: "asc" },
              include: {
                videoSources: true,
                subtitles: true,
              },
            },
          },
        },
      },
    });

    if (!series) {
      res.status(404).json({ success: false, message: "Series not found" });
      return;
    }

    let isWatchlisted = false;
    let isFavorite = false;
    let lastWatchedEpisodeId: string | null = null;
    let progressSeconds = 0;

    if (req.user) {
      const [watchlist, favorite, history] = await Promise.all([
        prisma.watchlist.findUnique({
          where: {
            userId_contentId: {
              userId: req.user.id,
              contentId: series.id,
            },
          },
        }),
        prisma.favorite.findUnique({
          where: {
            userId_contentId: {
              userId: req.user.id,
              contentId: series.id,
            },
          },
        }),
        prisma.watchHistory.findFirst({
          where: {
            userId: req.user.id,
            contentId: series.id,
            contentType: ContentType.SERIES,
          },
          orderBy: { lastWatchedAt: "desc" },
        }),
      ]);

      isWatchlisted = !!watchlist;
      isFavorite = !!favorite;
      if (history) {
        lastWatchedEpisodeId = history.episodeId;
        progressSeconds = history.progressSeconds;
      }
    }

    res.json({
      success: true,
      data: {
        ...series,
        genres: series.genres.map((g) => g.genre),
        cast: series.cast.map((c) => ({
          id: c.cast.id,
          name: c.cast.name,
          image: c.cast.image,
          characterName: c.characterName,
        })),
        userState: {
          isWatchlisted,
          isFavorite,
          lastWatchedEpisodeId,
          progressSeconds,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch series details" });
  }
};

export const getSeriesCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetSlugs = [
      "tv-web-series",
      "korean-tv-web-series",
      "cartoon-tv-series",
      "documentary",
      "wwe-aew-wrestling",
      "award-tv-shows",
    ];

    const categories = await prisma.genre.findMany({
      where: {
        slug: { in: targetSlugs },
      },
      include: {
        _count: {
          select: { series: true },
        },
      },
    });

    const ordered = targetSlugs.map((slug) => {
      const match = categories.find((c) => c.slug === slug);
      if (match) {
        return {
          id: match.id,
          name: match.name,
          slug: match.slug,
          count: match._count.series,
        };
      }
      return {
        id: 0,
        name: slug.replace(/-/g, " ").toUpperCase(),
        slug,
        count: 0,
      };
    });

    res.json({
      success: true,
      data: ordered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch series categories" });
  }
};
