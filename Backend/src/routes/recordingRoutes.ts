import { Router } from "express";
import { recordingController } from "../controllers/recordingController.js";

export const recordingRoutes = Router();

recordingRoutes.get("/", recordingController.getRecordings);
recordingRoutes.post("/", recordingController.createRecording);
