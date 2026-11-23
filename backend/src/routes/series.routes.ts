import { Router } from "express";
import { getSeries, getSeriesBySlug } from "../controllers/series.controller";
import { optionalAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getSeries);
router.get("/:slug", optionalAuth, getSeriesBySlug);

export default router;
