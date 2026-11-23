import { Router } from "express";
import { getSeasonById } from "../controllers/season.controller";

const router = Router();

router.get("/:id", getSeasonById);

export default router;
