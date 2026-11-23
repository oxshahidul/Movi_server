import { Router } from "express";
import {
  getLiveChannels,
  getLiveCategories,
  getFeaturedChannels,
  getChannelBySlug,
} from "../controllers/livetv.controller";

const router = Router();

router.get("/", getLiveChannels);
router.get("/categories", getLiveCategories);
router.get("/featured", getFeaturedChannels);
router.get("/:slug", getChannelBySlug);

export default router;
