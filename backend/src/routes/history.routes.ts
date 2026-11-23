import { Router } from "express";
import { recordProgress, getContinueWatching, deleteHistoryItem } from "../controllers/history.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);
router.post("/progress", recordProgress);
router.get("/continue-watching", getContinueWatching);
router.delete("/:id", deleteHistoryItem);

export default router;
