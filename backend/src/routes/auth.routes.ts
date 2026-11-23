import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updateUserSettings,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimit.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  updateProfileSchema,
  updateSettingsSchema,
} from "../validators/auth.validator";

const router = Router();

router.post("/register", authRateLimiter, validateBody(registerSchema), register);
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, validateBody(updateProfileSchema), updateProfile);
router.put("/settings", authenticate, validateBody(updateSettingsSchema), updateUserSettings);

// Password Reset & Email Verification
router.post("/forgot-password", authRateLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authRateLimiter, validateBody(resetPasswordSchema), resetPassword);
router.post("/send-verification", authenticate, sendVerificationEmail);
router.post("/verify-email", validateBody(verifyEmailSchema), verifyEmail);

export default router;
