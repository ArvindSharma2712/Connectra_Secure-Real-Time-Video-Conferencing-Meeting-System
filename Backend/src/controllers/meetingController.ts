import { Request, Response } from "express";
import { query, isDbConfigured } from "../config/db.js";

// In-memory fallback
const inMemoryMeetings: any[] = [
  {
    id: 1,
    meetingId: "zxc-vbn-mas",
    title: "Product Design Critique & Demo",
    description: "Reviewing latest prototype iterations, UX improvements, and video room grid adjustments.",
    status: "active",
    createdAt: new Date().toISOString(),
    scheduledFor: new Date().toISOString(),
    duration: 60,
    host: {
      id: "user_mock_001",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
    },
    participants: [],
  },
  {
    id: 2,
    meetingId: "qwe-rty-uio",
    title: "Sprint Planning & Roadmap Review",
    description: "Aligning team on Q3 deliverables, architecture revamps, and timeline estimates.",
    status: "ended",
    createdAt: "2026-08-14T09:30:00.000Z",
    endedAt: "2026-08-14T10:45:00.000Z",
    duration: 75,
    host: {
      id: "user_mock_001",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
    },
    participants: [],
  },
];

export const meetingController = {
  // Get all meetings
  async getMeetings(_req: Request, res: Response) {
    try {
      if (isDbConfigured) {
        const sql = `
          SELECT 
            m.*,
            u.name as host_name,
            u.email as host_email,
            u.image_url as host_image,
            COUNT(p.id) as participant_count
          FROM meetings m
          LEFT JOIN users u ON m.host_id = u.id
          LEFT JOIN participants p ON m.meeting_id = p.meeting_id
          GROUP BY m.id, u.name, u.email, u.image_url
          ORDER BY m.created_at DESC;
        `;
        const result = await query(sql);

        const formatted = result.rows.map((row) => ({
          id: row.id,
          meetingId: row.meeting_id,
          title: row.title,
          description: row.description,
          status: row.status,
          duration: row.duration,
          scheduledFor: row.scheduled_for,
          createdAt: row.created_at,
          endedAt: row.ended_at,
          passcode: row.passcode,
          requirePasscode: row.require_passcode,
          waitingRoom: row.waiting_room,
          muteOnEntry: row.mute_on_entry,
          host: {
            id: row.host_id,
            name: row.host_name || "Unknown Host",
            email: row.host_email || "",
            image: row.host_image || "",
          },
          participantCount: parseInt(row.participant_count, 10) || 0,
        }));

        return res.json(formatted);
      } else {
        return res.json(inMemoryMeetings);
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },

  // Get single meeting by meeting_id or numeric id
  async getMeetingById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (isDbConfigured) {
        const sql = `
          SELECT 
            m.*,
            u.name as host_name,
            u.email as host_email,
            u.image_url as host_image
          FROM meetings m
          LEFT JOIN users u ON m.host_id = u.id
          WHERE m.meeting_id = $1 OR CAST(m.id AS VARCHAR) = $1
          LIMIT 1;
        `;
        const result = await query(sql, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Meeting not found" });
        }

        const row = result.rows[0];

        // Fetch participants
        const pResult = await query(
          "SELECT * FROM participants WHERE meeting_id = $1 ORDER BY joined_at ASC",
          [row.meeting_id]
        );

        return res.json({
          id: row.id,
          meetingId: row.meeting_id,
          title: row.title,
          description: row.description,
          status: row.status,
          duration: row.duration,
          scheduledFor: row.scheduled_for,
          createdAt: row.created_at,
          endedAt: row.ended_at,
          passcode: row.passcode,
          requirePasscode: row.require_passcode,
          waitingRoom: row.waiting_room,
          muteOnEntry: row.mute_on_entry,
          host: {
            id: row.host_id,
            name: row.host_name || "Host",
            email: row.host_email || "",
            image: row.host_image || "",
          },
          participants: pResult.rows.map((p) => ({
            id: p.id,
            userId: p.user_id,
            name: p.name,
            email: p.email,
            isHost: p.is_host,
            joinedAt: p.joined_at,
            leftAt: p.left_at,
          })),
        });
      } else {
        const found = inMemoryMeetings.find(
          (m) => m.meetingId.toLowerCase() === id.toLowerCase() || String(m.id) === id
        );
        if (!found) return res.status(404).json({ error: "Meeting not found" });
        return res.json(found);
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },

  // Create new meeting
  async createMeeting(req: Request, res: Response) {
    try {
      const {
        title = "Instant Meeting",
        description = "",
        scheduledFor,
        duration = 45,
        passcode,
        waitingRoom = true,
        muteOnEntry = false,
        hostUser,
      } = req.body;

      // Generate friendly 3-3-3 meeting code: e.g. abc-def-ghi
      const letters = "abcdefghijklmnopqrstuvwxyz";
      const part = (len: number) =>
        Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
      const meetingId = `${part(3)}-${part(3)}-${part(3)}`;

      const status = scheduledFor ? "scheduled" : "active";

      if (isDbConfigured) {
        // Ensure host user exists in Neon
        const hostId = hostUser?.id || "user_mock_001";
        if (hostUser?.id && hostUser?.email) {
          await query(
            `INSERT INTO users (id, email, name, image_url)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;`,
            [hostUser.id, hostUser.email, hostUser.name || "Host", hostUser.image || null]
          );
        }

        const insertSql = `
          INSERT INTO meetings (
            meeting_id, title, description, status, host_id,
            passcode, require_passcode, waiting_room, mute_on_entry,
            duration, scheduled_for
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *;
        `;

        const result = await query(insertSql, [
          meetingId,
          title,
          description,
          status,
          hostId,
          passcode || null,
          Boolean(passcode),
          waitingRoom,
          muteOnEntry,
          duration,
          scheduledFor || new Date().toISOString(),
        ]);

        const dbMeeting = result.rows[0];

        // Insert host as first participant
        await query(
          `INSERT INTO participants (meeting_id, user_id, name, email, is_host)
           VALUES ($1, $2, $3, $4, true);`,
          [meetingId, hostId, hostUser?.name || "Host", hostUser?.email || ""]
        );

        console.log(`📹 [Neon DB] Meeting created: ${dbMeeting.title} (${dbMeeting.meeting_id})`);

        return res.status(201).json({
          id: dbMeeting.id,
          meetingId: dbMeeting.meeting_id,
          title: dbMeeting.title,
          description: dbMeeting.description,
          status: dbMeeting.status,
          duration: dbMeeting.duration,
          scheduledFor: dbMeeting.scheduled_for,
          createdAt: dbMeeting.created_at,
          passcode: dbMeeting.passcode,
          requirePasscode: dbMeeting.require_passcode,
          waitingRoom: dbMeeting.waiting_room,
          muteOnEntry: dbMeeting.mute_on_entry,
          host: {
            id: hostId,
            name: hostUser?.name || "Host",
            email: hostUser?.email || "",
          },
          participants: [
            {
              userId: hostId,
              name: hostUser?.name || "Host",
              email: hostUser?.email || "",
              isHost: true,
            },
          ],
        });
      } else {
        const newMeeting = {
          id: Date.now(),
          meetingId,
          title,
          description,
          status,
          duration,
          scheduledFor: scheduledFor || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          passcode,
          requirePasscode: Boolean(passcode),
          waitingRoom,
          muteOnEntry,
          host: {
            id: hostUser?.id || "user_mock_001",
            name: hostUser?.name || "Alex Rivera",
            email: hostUser?.email || "alex.rivera@example.com",
          },
          participants: [],
        };
        inMemoryMeetings.unshift(newMeeting);
        return res.status(201).json(newMeeting);
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },

  // Update meeting
  async updateMeeting(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, title, description, endedAt } = req.body;

      if (isDbConfigured) {
        const result = await query(
          `UPDATE meetings 
           SET status = COALESCE($1, status),
               title = COALESCE($2, title),
               description = COALESCE($3, description),
               ended_at = COALESCE($4, ended_at),
               updated_at = NOW()
           WHERE meeting_id = $5 OR CAST(id AS VARCHAR) = $5
           RETURNING *;`,
          [status, title, description, endedAt, id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Meeting not found" });
        }

        return res.json({ success: true, meeting: result.rows[0] });
      } else {
        const index = inMemoryMeetings.findIndex(
          (m) => m.meetingId === id || String(m.id) === id
        );
        if (index === -1) return res.status(404).json({ error: "Meeting not found" });
        inMemoryMeetings[index] = { ...inMemoryMeetings[index], ...req.body };
        return res.json({ success: true, meeting: inMemoryMeetings[index] });
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },

  // Delete meeting
  async deleteMeeting(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (isDbConfigured) {
        const result = await query(
          "DELETE FROM meetings WHERE meeting_id = $1 OR CAST(id AS VARCHAR) = $1 RETURNING id",
          [id]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Meeting not found" });
        }
        return res.json({ success: true, message: "Meeting deleted successfully" });
      } else {
        const initialLen = inMemoryMeetings.length;
        const filtered = inMemoryMeetings.filter(
          (m) => m.meetingId !== id && String(m.id) !== id
        );
        if (filtered.length === initialLen) {
          return res.status(404).json({ error: "Meeting not found" });
        }
        inMemoryMeetings.length = 0;
        inMemoryMeetings.push(...filtered);
        return res.json({ success: true, message: "Meeting deleted" });
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },

  // Add participant to meeting
  async addParticipant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId, name, email, isHost = false } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Participant name is required" });
      }

      if (isDbConfigured) {
        const result = await query(
          `INSERT INTO participants (meeting_id, user_id, name, email, is_host)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *;`,
          [id, userId || null, name, email || null, isHost]
        );
        return res.status(201).json({ success: true, participant: result.rows[0] });
      } else {
        return res.status(201).json({
          success: true,
          participant: {
            id: Date.now(),
            meetingId: id,
            userId,
            name,
            email,
            isHost,
            joinedAt: new Date().toISOString(),
          },
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },
};
