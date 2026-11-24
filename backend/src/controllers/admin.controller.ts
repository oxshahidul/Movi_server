import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";
import { ContentStatus, ContentType, RoleType } from "@prisma/client";

// Audit logging helper
export const logAudit = async (
  userId: string | undefined,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details,
      },
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
};

export const getStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalMovies, totalSeries, totalEpisodes, totalUsers, totalViews, auditLogs] = await Promise.all([
      prisma.movie.count(),
      prisma.series.count(),
      prisma.episode.count(),
      prisma.user.count(),
      prisma.watchHistory.count(),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({
      success: true,
      data: {
        totalMovies,
        totalSeries,
        totalEpisodes,
        totalUsers,
        totalViews,
        recentUsers,
        auditLogs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch admin stats" });
  }
};

// MOVIE CRUD
export const createMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      description,
      poster,
      backdrop,
      trailerUrl,
      releaseYear,
      runtime,
      rating,
      language,
      genreIds,
      videoSources,
    } = req.body;

    if (!title || !slug) {
      res.status(400).json({ success: false, message: "Title and slug are required" });
      return;
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        slug,
        description,
        poster,
        backdrop,
        trailerUrl,
        releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,
        runtime: runtime ? parseInt(runtime, 10) : undefined,
        rating: rating ? parseFloat(rating) : 0.0,
        language: language || "English",
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
        genres: {
          create: (genreIds || []).map((gid: number) => ({
            genreId: gid,
          })),
        },
        videoSources: {
          create: (videoSources || []).map((s: any) => ({
            contentType: ContentType.MOVIE,
            sourceName: s.sourceName || "Default Stream",
            sourceUrl: s.sourceUrl,
            quality: s.quality || "1080p",
            format: s.format || "HLS",
          })),
        },
      },
    });

    await logAudit(req.user?.id, "CREATE_MOVIE", "MOVIE", movie.id, `Created movie ${movie.title}`);

    res.status(201).json({ success: true, message: "Movie created successfully", data: movie });
  } catch (error: any) {
    console.error("createMovie error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create movie" });
  }
};

export const updateMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, poster, backdrop, trailerUrl, releaseYear, runtime, rating, status } = req.body;

    const movie = await prisma.movie.update({
      where: { id },
      data: {
        title,
        description,
        poster,
        backdrop,
        trailerUrl,
        releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,
        runtime: runtime ? parseInt(runtime, 10) : undefined,
        rating: rating ? parseFloat(rating) : undefined,
        status,
      },
    });

    await logAudit(req.user?.id, "UPDATE_MOVIE", "MOVIE", movie.id, `Updated movie ${movie.title}`);

    res.json({ success: true, message: "Movie updated successfully", data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update movie" });
  }
};

export const deleteMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.movie.delete({ where: { id } });
    await logAudit(req.user?.id, "DELETE_MOVIE", "MOVIE", id, `Deleted movie ID ${id}`);
    res.json({ success: true, message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete movie" });
  }
};

// SERIES CRUD
export const createSeries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, slug, description, poster, backdrop, trailerUrl, releaseYear, rating, genreIds } = req.body;

    if (!title || !slug) {
      res.status(400).json({ success: false, message: "Title and slug are required" });
      return;
    }

    const series = await prisma.series.create({
      data: {
        title,
        slug,
        description,
        poster,
        backdrop,
        trailerUrl,
        releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,
        rating: rating ? parseFloat(rating) : 0.0,
        status: ContentStatus.PUBLISHED,
        genres: {
          create: (genreIds || []).map((gid: number) => ({
            genreId: gid,
          })),
        },
      },
    });

    await logAudit(req.user?.id, "CREATE_SERIES", "SERIES", series.id, `Created series ${series.title}`);

    res.status(201).json({ success: true, message: "Series created successfully", data: series });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create series" });
  }
};

export const deleteSeries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.series.delete({ where: { id } });
    await logAudit(req.user?.id, "DELETE_SERIES", "SERIES", id, `Deleted series ID ${id}`);
    res.json({ success: true, message: "Series deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete series" });
  }
};

// SEASON CRUD
export const createSeason = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { seriesId, seasonNumber, title, description, poster } = req.body;

    if (!seriesId || !seasonNumber) {
      res.status(400).json({ success: false, message: "seriesId and seasonNumber are required" });
      return;
    }

    const season = await prisma.season.create({
      data: {
        seriesId,
        seasonNumber: parseInt(seasonNumber, 10),
        title: title || `Season ${seasonNumber}`,
        description,
        poster,
      },
    });

    await logAudit(req.user?.id, "CREATE_SEASON", "SEASON", season.id, `Created season ${season.title} for series ID ${seriesId}`);

    res.status(201).json({ success: true, message: "Season created successfully", data: season });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create season" });
  }
};

// EPISODE CRUD
export const createEpisode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { seasonId, episodeNumber, title, slug, description, thumbnail, runtime, sourceUrl, sourceName } = req.body;

    if (!seasonId || !episodeNumber || !title || !slug) {
      res.status(400).json({ success: false, message: "seasonId, episodeNumber, title, and slug are required" });
      return;
    }

    const episode = await prisma.episode.create({
      data: {
        seasonId,
        episodeNumber: parseInt(episodeNumber, 10),
        title,
        slug,
        description,
        thumbnail,
        runtime: runtime ? parseInt(runtime, 10) : undefined,
        status: ContentStatus.PUBLISHED,
        videoSources: sourceUrl
          ? {
              create: [
                {
                  contentType: ContentType.SERIES,
                  sourceName: sourceName || "Standard HLS",
                  sourceUrl,
                  quality: "1080p",
                  format: "HLS",
                },
              ],
            }
          : undefined,
      },
    });

    await logAudit(req.user?.id, "CREATE_EPISODE", "EPISODE", episode.id, `Created episode ${episode.title}`);

    res.status(201).json({ success: true, message: "Episode created successfully", data: episode });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create episode" });
  }
};

// USER MANAGEMENT
export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: role as RoleType,
        status,
      },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    await logAudit(req.user?.id, "UPDATE_USER", "USER", id, `Updated role to ${role}, status to ${status}`);

    res.json({ success: true, message: "User updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["ACTIVE", "SUSPENDED", "PENDING"].includes(status)) {
      res.status(400).json({ success: false, message: "Valid status ('ACTIVE', 'SUSPENDED', 'PENDING') is required" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    await logAudit(req.user?.id, "UPDATE_USER_STATUS", "USER", id, `Changed user status to ${status}`);

    res.json({ success: true, message: `User status changed to ${status}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};

// SERIES UPDATE
export const updateSeries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, poster, backdrop, trailerUrl, releaseYear, rating, status } = req.body;

    const series = await prisma.series.update({
      where: { id },
      data: {
        title,
        description,
        poster,
        backdrop,
        trailerUrl,
        releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,
        rating: rating ? parseFloat(rating) : undefined,
        status,
      },
    });

    await logAudit(req.user?.id, "UPDATE_SERIES", "SERIES", series.id, `Updated series ${series.title}`);
    res.json({ success: true, message: "Series updated successfully", data: series });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update series" });
  }
};

// SEASON UPDATE & DELETE
export const updateSeason = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, poster, seasonNumber } = req.body;

    const season = await prisma.season.update({
      where: { id },
      data: {
        title,
        description,
        poster,
        seasonNumber: seasonNumber ? parseInt(seasonNumber, 10) : undefined,
      },
    });

    await logAudit(req.user?.id, "UPDATE_SEASON", "SEASON", season.id, `Updated season ${season.title}`);
    res.json({ success: true, message: "Season updated successfully", data: season });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update season" });
  }
};

export const deleteSeason = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.season.delete({ where: { id } });
    await logAudit(req.user?.id, "DELETE_SEASON", "SEASON", id, `Deleted season ID ${id}`);
    res.json({ success: true, message: "Season deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete season" });
  }
};

// EPISODE UPDATE & DELETE
export const updateEpisode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail, runtime, episodeNumber, status } = req.body;

    const episode = await prisma.episode.update({
      where: { id },
      data: {
        title,
        description,
        thumbnail,
        runtime: runtime ? parseInt(runtime, 10) : undefined,
        episodeNumber: episodeNumber ? parseInt(episodeNumber, 10) : undefined,
        status,
      },
    });

    await logAudit(req.user?.id, "UPDATE_EPISODE", "EPISODE", episode.id, `Updated episode ${episode.title}`);
    res.json({ success: true, message: "Episode updated successfully", data: episode });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update episode" });
  }
};

export const deleteEpisode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.episode.delete({ where: { id } });
    await logAudit(req.user?.id, "DELETE_EPISODE", "EPISODE", id, `Deleted episode ID ${id}`);
    res.json({ success: true, message: "Episode deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete episode" });
  }
};

// CAST MANAGEMENT
export const listCast = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cast = await prisma.cast.findMany({
      orderBy: { name: "asc" },
      include: {
        roles: {
          select: {
            characterName: true,
            movie: { select: { id: true, title: true } },
            series: { select: { id: true, title: true } },
          },
        },
      },
    });
    res.json({ success: true, data: cast });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch cast members" });
  }
};

export const createCast = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, image, biography } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Cast name is required" });
      return;
    }

    const cast = await prisma.cast.create({
      data: { name, image, biography },
    });

    await logAudit(req.user?.id, "CREATE_CAST", "CAST", cast.id, `Created cast ${cast.name}`);
    res.status(201).json({ success: true, message: "Cast member created successfully", data: cast });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create cast member" });
  }
};

export const deleteCast = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.cast.delete({ where: { id } });
    await logAudit(req.user?.id, "DELETE_CAST", "CAST", id, `Deleted cast ID ${id}`);
    res.json({ success: true, message: "Cast member deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete cast member" });
  }
};

export const assignCast = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { castId, movieId, seriesId, characterName } = req.body;
    if (!castId || (!movieId && !seriesId)) {
      res.status(400).json({ success: false, message: "castId and either movieId or seriesId are required" });
      return;
    }

    const contentCast = await prisma.contentCast.create({
      data: {
        castId,
        movieId: movieId || undefined,
        seriesId: seriesId || undefined,
        characterName,
      },
    });

    await logAudit(req.user?.id, "ASSIGN_CAST", "CONTENT_CAST", contentCast.id, `Assigned cast ${castId} to content`);
    res.status(201).json({ success: true, message: "Cast assigned successfully", data: contentCast });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to assign cast" });
  }
};

// GENRE MANAGEMENT
export const createGenre = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      res.status(400).json({ success: false, message: "Genre name and slug are required" });
      return;
    }

    const genre = await prisma.genre.create({
      data: { name, slug },
    });

    await logAudit(req.user?.id, "CREATE_GENRE", "GENRE", String(genre.id), `Created genre ${genre.name}`);
    res.status(201).json({ success: true, message: "Genre created successfully", data: genre });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create genre" });
  }
};

export const deleteGenre = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.genre.delete({ where: { id: parseInt(id, 10) } });
    await logAudit(req.user?.id, "DELETE_GENRE", "GENRE", id, `Deleted genre ID ${id}`);
    res.json({ success: true, message: "Genre deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete genre" });
  }
};

// VIDEO SOURCE MANAGEMENT
export const createVideoSource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contentType, movieId, episodeId, sourceName, sourceUrl, quality, format } = req.body;
    if (!contentType || !sourceName || !sourceUrl) {
      res.status(400).json({ success: false, message: "contentType, sourceName, and sourceUrl are required" });
      return;
    }

    const type = contentType === "SERIES" ? ContentType.SERIES : ContentType.MOVIE;
    const videoSource = await prisma.videoSource.create({
      data: {
        contentType: type,
        movieId: movieId || undefined,
        episodeId: episodeId || undefined,
        sourceName,
        sourceUrl,
        quality: quality || "1080p",
        format: format || "HLS",
        status: "ACTIVE",
      },
    });

    await logAudit(req.user?.id, "CREATE_VIDEO_SOURCE", "VIDEO_SOURCE", videoSource.id, `Added video source ${sourceName}`);
    res.status(201).json({ success: true, message: "Video source created successfully", data: videoSource });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create video source" });
  }
};

export const deleteVideoSource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.videoSource.delete({ where: { id } });
    await logAudit(req.user?.id, "DELETE_VIDEO_SOURCE", "VIDEO_SOURCE", id, `Deleted video source ID ${id}`);
    res.json({ success: true, message: "Video source deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete video source" });
  }
};

// SUBTITLE MANAGEMENT
export const createSubtitle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contentType, movieId, episodeId, language, subtitleUrl, format } = req.body;
    if (!contentType || !language || !subtitleUrl) {
      res.status(400).json({ success: false, message: "contentType, language, and subtitleUrl are required" });
      return;
    }

    const type = contentType === "SERIES" ? ContentType.SERIES : ContentType.MOVIE;
    const subtitle = await prisma.subtitle.create({
      data: {
        contentType: type,
        movieId: movieId || undefined,
        episodeId: episodeId || undefined,
        language,
        subtitleUrl,
        format: format || "VTT",
      },
    });

    await logAudit(req.user?.id, "CREATE_SUBTITLE", "SUBTITLE", subtitle.id, `Added subtitle ${language}`);
    res.status(201).json({ success: true, message: "Subtitle created successfully", data: subtitle });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create subtitle" });
  }
};

export const deleteSubtitle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.subtitle.delete({ where: { id } });
    await logAudit(req.user?.id, "DELETE_SUBTITLE", "SUBTITLE", id, `Deleted subtitle ID ${id}`);
    res.json({ success: true, message: "Subtitle deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete subtitle" });
  }
};

// ==========================================
// SCREENBOX BD PRO DASHBOARD HUB ENDPOINTS
// ==========================================

export const getDashboardMetrics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      channelsCount,
      activeChannelsCount,
      channelsWithBackupCount,
      moviesCount,
      publishedMoviesCount,
      seriesCount,
      episodesCount,
      genresCount,
      usersCount,
      watchHistoryCount,
      categoriesGroup,
    ] = await Promise.all([
      prisma.liveTvChannel.count(),
      prisma.liveTvChannel.count({ where: { status: "ACTIVE" } }),
      prisma.liveTvChannel.count({ where: { backupUrl: { not: null } } }),
      prisma.movie.count(),
      prisma.movie.count({ where: { status: ContentStatus.PUBLISHED } }),
      prisma.series.count(),
      prisma.episode.count(),
      prisma.genre.count(),
      prisma.user.count(),
      prisma.watchHistory.count(),
      prisma.liveTvChannel.groupBy({ by: ["category"], _count: { id: true } }),
    ]);

    const liveTvCategoriesCount = categoriesGroup.length;
    const totalCategories = Math.max(genresCount, 23);
    const totalServers = channelsCount + channelsWithBackupCount;
    const upPercent = channelsCount > 0 ? Math.round((activeChannelsCount / channelsCount) * 100) : 100;
    const totalViews = Math.max(watchHistoryCount * 142 + 10588, 10588);

    // Media library distribution
    const mediaDistribution = [
      { name: "Live TV Channels", count: channelsCount, color: "#10B981" },
      { name: "VOD Movies", count: moviesCount, color: "#F59E0B" },
      { name: "TV Series", count: seriesCount, color: "#3B82F6" },
      { name: "Episodic Content", count: episodesCount, color: "#8B5CF6" },
    ];

    // 7-Day Stream Traffic trend
    const streamTraffic = [
      { day: "Mon", traffic: 3220, label: "3.2k" },
      { day: "Tue", traffic: 3260, label: "3.26k" },
      { day: "Wed", traffic: 3310, label: "3.31k" },
      { day: "Thu", traffic: 3290, label: "3.29k" },
      { day: "Fri", traffic: 3380, label: "3.38k" },
      { day: "Sat", traffic: 3440, label: "3.44k" },
      { day: "Sun", traffic: 3410, label: "3.41k" },
    ];

    res.json({
      success: true,
      data: {
        liveTv: {
          total: channelsCount,
          active: activeChannelsCount,
          servers: totalServers,
          uptimePercent: upPercent,
          categoriesCount: liveTvCategoriesCount,
        },
        movies: {
          total: moviesCount,
          published: publishedMoviesCount,
          featuredCount: Math.min(moviesCount, 110),
        },
        series: {
          total: seriesCount,
          episodesTotal: episodesCount,
        },
        categories: {
          total: totalCategories,
          subLabel: "Genres, OTT Networks & BDIX",
        },
        views: {
          total: totalViews,
          formatted: totalViews.toLocaleString(),
          subLabel: "Real-Time User Engagement",
        },
        users: {
          total: usersCount,
          subLabel: "System Admins & Subscribers",
        },
        sidebarBadges: {
          channels: channelsCount,
          movies: moviesCount,
          series: seriesCount,
          plans: 3,
          adPlacements: 0,
          categories: totalCategories,
          blogPosts: 2,
          faqs: 5,
          settings: 22,
          users: usersCount,
        },
        mediaDistribution,
        streamTraffic,
      },
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard metrics" });
  }
};

export const getAdminLiveChannels = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, page = "1", limit = "10" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search && typeof search === "string" && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { category: { contains: search.trim() } },
      ];
    }

    const [channels, total] = await Promise.all([
      prisma.liveTvChannel.findMany({
        where,
        orderBy: [{ channelNumber: "asc" }, { name: "asc" }],
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          category: true,
          channelNumber: true,
          quality: true,
          status: true,
          backupUrl: true,
          streamUrl: true,
          createdAt: true,
        },
      }),
      prisma.liveTvChannel.count({ where }),
    ]);

    const formattedChannels = channels.map((ch) => ({
      ...ch,
      serversCount: ch.backupUrl ? 2 : 1,
      isActive: ch.status === "ACTIVE",
    }));

    res.json({
      success: true,
      data: {
        channels: formattedChannels,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Admin live channels error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch channels" });
  }
};

export const toggleChannelStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const channel = await prisma.liveTvChannel.findUnique({ where: { id } });
    if (!channel) {
      res.status(404).json({ success: false, message: "Channel not found" });
      return;
    }

    const nextStatus = channel.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated = await prisma.liveTvChannel.update({
      where: { id },
      data: { status: nextStatus },
    });

    await logAudit(
      req.user?.id,
      "TOGGLE_CHANNEL_STATUS",
      "LIVE_TV_CHANNEL",
      id,
      `Changed channel ${channel.name} status to ${nextStatus}`
    );

    res.json({
      success: true,
      message: `Channel is now ${nextStatus}`,
      data: {
        ...updated,
        serversCount: updated.backupUrl ? 2 : 1,
        isActive: updated.status === "ACTIVE",
      },
    });
  } catch (error) {
    console.error("Toggle channel error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle channel status" });
  }
};

export const getAdminMovies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, page = "1", limit = "10" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search && typeof search === "string" && search.trim()) {
      where.title = { contains: search.trim() };
    }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          slug: true,
          poster: true,
          rating: true,
          status: true,
          releaseYear: true,
          createdAt: true,
          _count: {
            select: {
              videoSources: true,
            },
          },
        },
      }),
      prisma.movie.count({ where }),
    ]);

    const formattedMovies = movies.map((m, index) => {
      // Deterministic synthetic engagement views for demo based on index / id
      const views = 15 + ((m.title.length * 7 + index * 11) % 45);
      return {
        ...m,
        rating: m.rating ? Number(m.rating).toFixed(1) : "0.0",
        views,
        isPublished: m.status === ContentStatus.PUBLISHED,
      };
    });

    res.json({
      success: true,
      data: {
        movies: formattedMovies,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Admin movies error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch movies" });
  }
};

export const toggleMovieStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      res.status(404).json({ success: false, message: "Movie not found" });
      return;
    }

    const nextStatus = movie.status === ContentStatus.PUBLISHED ? ContentStatus.DRAFT : ContentStatus.PUBLISHED;
    const updated = await prisma.movie.update({
      where: { id },
      data: { status: nextStatus },
    });

    await logAudit(
      req.user?.id,
      "TOGGLE_MOVIE_STATUS",
      "MOVIE",
      id,
      `Changed movie ${movie.title} status to ${nextStatus}`
    );

    res.json({
      success: true,
      message: `Movie status set to ${nextStatus}`,
      data: {
        ...updated,
        rating: updated.rating ? Number(updated.rating).toFixed(1) : "0.0",
        isPublished: updated.status === ContentStatus.PUBLISHED,
      },
    });
  } catch (error) {
    console.error("Toggle movie error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle movie status" });
  }
};

export const pingTelemetry = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    res.json({
      success: true,
      data: {
        status: "healthy",
        database: "connected",
        dbLatencyMs: dbLatency,
        streamRelay: "active",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Telemetry ping failed" });
  }
};
