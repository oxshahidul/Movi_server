import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  getUserStats,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { updateProfileSchema, updateSettingsSchema } from "../validators/auth.validator";

const router = Router();

router.use(authenticate);

router.get("/profile", getUserProfile);
router.put("/profile", validateBody(updateProfileSchema), updateUserProfile);
router.get("/settings", getUserSettings);
router.put("/settings", validateBody(updateSettingsSchema), updateUserSettings);
router.get("/stats", getUserStats);

export default router;
