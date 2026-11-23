import { Router } from "express";
import {
  getWatchlist,
  toggleWatchlist,
  toggleFavorite,
  submitRating,
} from "../controllers/library.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/watchlist", getWatchlist);
router.post("/watchlist/toggle", toggleWatchlist);
router.post("/favorites/toggle", toggleFavorite);
router.post("/rate", submitRating);

export default router;
