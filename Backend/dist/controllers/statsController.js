import { query, isDbConfigured } from "../config/db.js";
export const statsController = {
    async getStats(_req, res) {
        try {
            if (isDbConfigured) {
                const meetingsCountResult = await query("SELECT COUNT(*) FROM meetings;");
                const activeMeetingsResult = await query("SELECT COUNT(*) FROM meetings WHERE status = 'active';");
                const participantsCountResult = await query("SELECT COUNT(*) FROM participants;");
                const usersCountResult = await query("SELECT COUNT(*) FROM users;");
                const totalMeetings = parseInt(meetingsCountResult.rows[0].count, 10) || 0;
                const activeMeetings = parseInt(activeMeetingsResult.rows[0].count, 10) || 0;
                const totalParticipants = parseInt(participantsCountResult.rows[0].count, 10) || 0;
                const totalUsers = parseInt(usersCountResult.rows[0].count, 10) || 0;
                return res.json({
                    source: "neon-postgres",
                    plan: "premium",
                    monthlyCount: totalMeetings,
                    monthlyLimit: null, // Unlimited for premium
                    maxParticipants: 100,
                    totalMinutes: totalMeetings * 45 + 120,
                    activeMeetingsCount: activeMeetings,
                    totalParticipants,
                    totalUsers,
                });
            }
            else {
                return res.json({
                    source: "in-memory-fallback",
                    plan: "premium",
                    monthlyCount: 8,
                    monthlyLimit: null,
                    maxParticipants: 100,
                    totalMinutes: 1420,
                    activeMeetingsCount: 1,
                    totalParticipants: 24,
                    totalUsers: 4,
                });
            }
        }
        catch (err) {
            const error = err;
            return res.status(500).json({ error: error.message });
        }
    },
};
