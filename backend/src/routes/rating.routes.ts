import { Router } from "express";
import { getContentRatings, postRating } from "../controllers/rating.controller";
import { authenticate, optionalAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { ratingSchema } from "../validators/interaction.validator";

const router = Router();

router.get("/:contentType/:contentId", optionalAuth, getContentRatings);
router.post("/", authenticate, validateBody(ratingSchema), postRating);

export default router;
