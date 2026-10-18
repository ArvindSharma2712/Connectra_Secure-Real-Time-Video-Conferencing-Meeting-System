import { Request, Response } from "express";
import { query, isDbConfigured } from "../config/db.js";

const INITIAL_RECORDINGS = [
  {
    id: "rec_001",
    meetingId: "qwe-rty-uio",
    title: "Sprint Planning & Roadmap Review",
    duration: "1h 15m",
    fileSize: "428 MB",
    thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    hostName: "Alex Rivera",
    views: 14,
  },
  {
    id: "rec_002",
    meetingId: "arc-design-392",
    title: "Design System Architecture Sync",
    duration: "48m",
    fileSize: "275 MB",
    thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    hostName: "Sarah Chen",
    views: 29,
  },
  {
    id: "rec_003",
    meetingId: "sec-audit-102",
    title: "Security & SOC2 Compliance Briefing",
    duration: "32m",
    fileSize: "189 MB",
    thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    hostName: "Elena Rostova",
    views: 8,
  },
];

export const recordingController = {
  async getRecordings(_req: Request, res: Response) {
    try {
      if (isDbConfigured) {
        const result = await query("SELECT * FROM recordings ORDER BY created_at DESC");
        if (result.rows.length === 0) {
          // Return default initial list if DB table is fresh
          return res.json(INITIAL_RECORDINGS);
        }
        return res.json(
          result.rows.map((r) => ({
            id: r.id,
            meetingId: r.meeting_id,
            title: r.title,
            duration: r.duration,
            fileSize: r.file_size,
            thumbnail: r.thumbnail,
            videoUrl: r.video_url,
            hostName: r.host_name,
            views: r.views,
            createdAt: r.created_at,
          }))
        );
      } else {
        return res.json(INITIAL_RECORDINGS);
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },

  async createRecording(req: Request, res: Response) {
    try {
      const { meetingId, title, duration, fileSize, thumbnail, videoUrl, hostName } = req.body;
      const recId = `rec_${Date.now()}`;

      if (isDbConfigured) {
        const result = await query(
          `INSERT INTO recordings (id, meeting_id, title, duration, file_size, thumbnail, video_url, host_name)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *;`,
          [recId, meetingId, title, duration, fileSize, thumbnail, videoUrl, hostName]
        );
        return res.status(201).json(result.rows[0]);
      } else {
        const newRec = {
          id: recId,
          meetingId,
          title,
          duration,
          fileSize,
          thumbnail,
          videoUrl,
          hostName,
          views: 0,
        };
        INITIAL_RECORDINGS.unshift(newRec);
        return res.status(201).json(newRec);
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },
};
