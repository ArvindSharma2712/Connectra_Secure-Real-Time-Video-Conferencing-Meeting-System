import { Router } from "express";
import { statsController } from "../controllers/statsController.js";
export const statsRoutes = Router();
statsRoutes.get("/", statsController.getStats);
