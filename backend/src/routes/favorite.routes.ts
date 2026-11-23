import { Router } from "express";
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from "../controllers/favorite.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { favoriteSchema } from "../validators/interaction.validator";

const router = Router();

router.use(authenticate);

router.get("/", getFavorites);
router.post("/", validateBody(favoriteSchema), addToFavorites);
router.delete("/:contentId", removeFromFavorites);

export default router;
