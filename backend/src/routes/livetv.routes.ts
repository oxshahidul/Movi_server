import { Router } from "express";
import {
  getLiveChannels,
  getLiveCategories,
  getFeaturedChannels,
  getChannelBySlug,
  proxyLiveStream,
} from "../controllers/livetv.controller";

const router = Router();

router.get("/", getLiveChannels);
router.get("/categories", getLiveCategories);
router.get("/featured", getFeaturedChannels);
router.get("/proxy", proxyLiveStream);
router.get("/:slug", getChannelBySlug);

export default router;
