import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { ContentStatus, ContentType } from "@prisma/client";

export const getMovies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 16;
    const genre = req.query.genre as string;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || "newest";

    const skip = (page - 1) * limit;

    const where: any = {
      status: ContentStatus.PUBLISHED,
    };

    if (year) {
      where.releaseYear = year;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (genre) {
      where.genres = {
        some: {
          genre: {
            slug: genre,
          },
        },
      };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "rating") {
      orderBy = { rating: "desc" };
    } else if (sortBy === "title") {
      orderBy = { title: "asc" };
    } else if (sortBy === "year") {
      orderBy = { releaseYear: "desc" };
    }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      }),
      prisma.movie.count({ where }),
    ]);

    const formatted = movies.map((m) => ({
      ...m,
      genres: m.genres.map((g) => g.genre),
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
    console.error("getMovies error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch movies" });
  }
};

export const getFeaturedMovies = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const featured = await prisma.movie.findMany({
      where: { status: ContentStatus.PUBLISHED },
      take: 6,
      orderBy: { rating: "desc" },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    const formatted = featured.map((m) => ({
      ...m,
      genres: m.genres.map((g) => g.genre),
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch featured movies" });
  }
};

export const getMovieBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const movie = await prisma.movie.findUnique({
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
        videoSources: true,
        subtitles: true,
      },
    });

    if (!movie) {
      res.status(404).json({ success: false, message: "Movie not found" });
      return;
    }

    let userProgress = 0;
    let isWatchlisted = false;
    let isFavorite = false;

    if (req.user) {
      const [history, watchlist, favorite] = await Promise.all([
        prisma.watchHistory.findFirst({
          where: {
            userId: req.user.id,
            contentId: movie.id,
            contentType: ContentType.MOVIE,
          },
        }),
        prisma.watchlist.findUnique({
          where: {
            userId_contentId: {
              userId: req.user.id,
              contentId: movie.id,
            },
          },
        }),
        prisma.favorite.findUnique({
          where: {
            userId_contentId: {
              userId: req.user.id,
              contentId: movie.id,
            },
          },
        }),
      ]);

      userProgress = history?.progressSeconds || 0;
      isWatchlisted = !!watchlist;
      isFavorite = !!favorite;
    }

    res.json({
      success: true,
      data: {
        ...movie,
        genres: movie.genres.map((g) => g.genre),
        cast: movie.cast.map((c) => ({
          id: c.cast.id,
          name: c.cast.name,
          image: c.cast.image,
          characterName: c.characterName,
        })),
        userState: {
          progressSeconds: userProgress,
          isWatchlisted,
          isFavorite,
        },
      },
    });
  } catch (error) {
    console.error("getMovieBySlug error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch movie details" });
  }
};

export const getMovieRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const currentMovie = await prisma.movie.findUnique({
      where: { slug },
      include: {
        genres: true,
      },
    });

    if (!currentMovie) {
      res.status(404).json({ success: false, message: "Movie not found" });
      return;
    }

    const genreIds = currentMovie.genres.map((g) => g.genreId);

    // Find other movies with matching genres first
    let recommendations = await prisma.movie.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        id: { not: currentMovie.id },
        genres: {
          some: {
            genreId: { in: genreIds },
          },
        },
      },
      take: limit,
      orderBy: [{ rating: "desc" }, { releaseYear: "desc" }],
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    // If fewer than limit, backfill with other top-rated/latest movies
    if (recommendations.length < limit) {
      const existingIds = [currentMovie.id, ...recommendations.map((m) => m.id)];
      const backfill = await prisma.movie.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          id: { notIn: existingIds },
        },
        take: limit - recommendations.length,
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        include: {
          genres: {
            include: {
              genre: true,
            },
          },
        },
      });
      recommendations = [...recommendations, ...backfill];
    }

    const formatted = recommendations.map((m) => ({
      ...m,
      genres: m.genres.map((g) => g.genre),
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("getMovieRecommendations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch movie recommendations" });
  }
};
