import { Router } from "express";
import { getSeries, getSeriesBySlug, getSeriesCategories } from "../controllers/series.controller";
import { optionalAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getSeries);
router.get("/categories", getSeriesCategories);
router.get("/:slug", optionalAuth, getSeriesBySlug);

export default router;
