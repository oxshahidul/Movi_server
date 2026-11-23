import { Router } from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlist.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { watchlistSchema } from "../validators/interaction.validator";

const router = Router();

router.use(authenticate);

router.get("/", getWatchlist);
router.post("/", validateBody(watchlistSchema), addToWatchlist);
router.delete("/:contentId", removeFromWatchlist);

export default router;
