import { Router } from "express";
import {
  getMovies,
  getFeaturedMovies,
  getMovieBySlug,
  getMovieRecommendations,
} from "../controllers/movie.controller";
import { optionalAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getMovies);
router.get("/featured", getFeaturedMovies);
router.get("/:slug/recommendations", getMovieRecommendations);
router.get("/:slug", optionalAuth, getMovieBySlug);

export default router;
