import { Router } from "express";
import { getEpisodeById, getEpisodeBySlug } from "../controllers/episode.controller";
import { optionalAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/:id", optionalAuth, getEpisodeById);
router.get("/slug/:slug", optionalAuth, getEpisodeBySlug);

export default router;
