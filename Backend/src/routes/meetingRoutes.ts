import { Router } from "express";
import { meetingController } from "../controllers/meetingController.js";

export const meetingRoutes = Router();

// GET /api/meetings - List meetings
meetingRoutes.get("/", meetingController.getMeetings);

// POST /api/meetings - Create meeting
meetingRoutes.post("/", meetingController.createMeeting);

// GET /api/meetings/:id - Get meeting details
meetingRoutes.get("/:id", meetingController.getMeetingById);

// PATCH /api/meetings/:id - Update meeting
meetingRoutes.patch("/:id", meetingController.updateMeeting);

// DELETE /api/meetings/:id - Delete meeting
meetingRoutes.delete("/:id", meetingController.deleteMeeting);

// POST /api/meetings/:id/participants - Add participant to meeting
meetingRoutes.post("/:id/participants", meetingController.addParticipant);
