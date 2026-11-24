import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import movieRoutes from "./movie.routes";
import seriesRoutes from "./series.routes";
import seasonRoutes from "./season.routes";
import episodeRoutes from "./episode.routes";
import genreRoutes from "./genre.routes";
import searchRoutes from "./search.routes";
import historyRoutes from "./history.routes";
import watchlistRoutes from "./watchlist.routes";
import favoriteRoutes from "./favorite.routes";
import ratingRoutes from "./rating.routes";
import adminRoutes from "./admin.routes";
import libraryRoutes from "./library.routes";
import liveTvRoutes from "./livetv.routes";
import prisma from "../prisma/client";

const router = Router();

// Health check endpoint
router.get("/health", async (_req, res) => {
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "healthy",
      service: "nexflix-api",
      version: "1.0.0",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: "degraded",
      service: "nexflix-api",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Prometheus / Monitoring metrics endpoint
router.get("/metrics", async (_req, res) => {
  try {
    const memory = process.memoryUsage();
    const uptime = process.uptime();
    const [userCount, movieCount, seriesCount] = await Promise.all([
      prisma.user.count(),
      prisma.movie.count(),
      prisma.series.count(),
    ]);

    res.json({
      service: "nexflix-api",
      uptimeSeconds: uptime,
      memory: {
        rssMb: (memory.rss / (1024 * 1024)).toFixed(2),
        heapUsedMb: (memory.heapUsed / (1024 * 1024)).toFixed(2),
        heapTotalMb: (memory.heapTotal / (1024 * 1024)).toFixed(2),
      },
      counts: {
        users: userCount,
        movies: movieCount,
        series: seriesCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to generate metrics", error: error.message });
  }
});

// Master Plan Section 9: 13 Core REST API Routers
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/movies", movieRoutes);
router.use("/series", seriesRoutes);
router.use("/seasons", seasonRoutes);
router.use("/episodes", episodeRoutes);
router.use("/genres", genreRoutes);
router.use("/search", searchRoutes);
router.use("/watch-history", historyRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/ratings", ratingRoutes);
router.use("/admin", adminRoutes);
router.use("/live-tv", liveTvRoutes);

// Compatibility fallback
router.use("/library", libraryRoutes);

export default router;
