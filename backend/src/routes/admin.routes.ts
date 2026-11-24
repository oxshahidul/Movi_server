import { Router } from "express";
import {
  getStats,
  createMovie,
  updateMovie,
  deleteMovie,
  createSeries,
  updateSeries,
  deleteSeries,
  createSeason,
  updateSeason,
  deleteSeason,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  listCast,
  createCast,
  deleteCast,
  assignCast,
  createGenre,
  deleteGenre,
  createVideoSource,
  deleteVideoSource,
  createSubtitle,
  deleteSubtitle,
  getUsers,
  updateUserRole,
  updateUserStatus,
  getDashboardMetrics,
  getAdminLiveChannels,
  toggleChannelStatus,
  getAdminMovies,
  toggleMovieStatus,
  pingTelemetry,
} from "../controllers/admin.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { RoleType } from "@prisma/client";
import { validateBody } from "../middleware/validate.middleware";
import {
  createMovieSchema,
  updateMovieSchema,
  createSeriesSchema,
  createSeasonSchema,
  createEpisodeSchema,
  createCastSchema,
  assignCastSchema,
  createVideoSourceSchema,
  createSubtitleSchema,
} from "../validators/content.validator";

const router = Router();

router.use(authenticate);
router.use(requireRole([RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.CONTENT_MANAGER]));

// Stats & Metrics Hub
router.get("/stats", getStats);
router.get("/dashboard-metrics", getDashboardMetrics);
router.get("/telemetry/ping", pingTelemetry);

// Admin Dual Table Endpoints
router.get("/live-tv", getAdminLiveChannels);
router.patch("/live-tv/:id/toggle", toggleChannelStatus);
router.get("/movies", getAdminMovies);
router.patch("/movies/:id/toggle", toggleMovieStatus);

// Movie Management
router.post("/movies", validateBody(createMovieSchema), createMovie);
router.put("/movies/:id", validateBody(updateMovieSchema), updateMovie);
router.delete("/movies/:id", deleteMovie);

// Series Management
router.post("/series", validateBody(createSeriesSchema), createSeries);
router.put("/series/:id", updateSeries);
router.delete("/series/:id", deleteSeries);

// Season Management
router.post("/seasons", validateBody(createSeasonSchema), createSeason);
router.put("/seasons/:id", updateSeason);
router.delete("/seasons/:id", deleteSeason);

// Episode Management
router.post("/episodes", validateBody(createEpisodeSchema), createEpisode);
router.put("/episodes/:id", updateEpisode);
router.delete("/episodes/:id", deleteEpisode);

// Cast Management
router.get("/cast", listCast);
router.post("/cast", validateBody(createCastSchema), createCast);
router.delete("/cast/:id", deleteCast);
router.post("/cast/assign", validateBody(assignCastSchema), assignCast);

// Genre Management
router.post("/genres", createGenre);
router.delete("/genres/:id", deleteGenre);

// Video Sources Management
router.post("/video-sources", validateBody(createVideoSourceSchema), createVideoSource);
router.delete("/video-sources/:id", deleteVideoSource);

// Subtitle Management
router.post("/subtitles", validateBody(createSubtitleSchema), createSubtitle);
router.delete("/subtitles/:id", deleteSubtitle);

// User Management (Super Admin & Admin only)
router.get("/users", requireRole([RoleType.SUPER_ADMIN, RoleType.ADMIN]), getUsers);
router.put("/users/:id", requireRole([RoleType.SUPER_ADMIN]), updateUserRole);
router.patch("/users/:id/status", requireRole([RoleType.SUPER_ADMIN, RoleType.ADMIN]), updateUserStatus);

export default router;
