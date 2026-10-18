import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDbConnection, isDbConfigured } from "./config/db.js";
import { runMigrations } from "./db/migrate.js";
import { userRoutes } from "./routes/userRoutes.js";
import { meetingRoutes } from "./routes/meetingRoutes.js";
import { recordingRoutes } from "./routes/recordingRoutes.js";
import { statsRoutes } from "./routes/statsRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors({
    origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    credentials: true,
}));
app.use(express.json());
// Request logger
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Health check endpoint
app.get("/api/health", async (_req, res) => {
    const dbConnected = await testDbConnection();
    res.json({
        status: "ok",
        service: "Connectra Backend API (PERN Stack)",
        timestamp: new Date().toISOString(),
        database: {
            type: "Neon PostgreSQL",
            configured: isDbConfigured,
            connected: dbConnected,
        },
    });
});
// API Routes
app.use("/api/users", userRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/recordings", recordingRoutes);
app.use("/api/stats", statsRoutes);
// Global 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});
// Start Express server
async function startServer() {
    console.log("🚀 Starting Connectra PERN Backend Server...");
    // Verify and initialize Neon PostgreSQL database
    const connected = await testDbConnection();
    if (connected) {
        await runMigrations();
    }
    else {
        console.log("\x1b[33m%s\x1b[0m", "💡 Tip: To connect Neon PostgreSQL, open 'Backend/.env' and paste your DATABASE_URL=postgresql://... from console.neon.tech");
    }
    app.listen(PORT, () => {
        console.log("\x1b[32m%s\x1b[0m", `🌟 Connectra API server running on http://localhost:${PORT}`);
        console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`👥 User Sync Endpoint: POST http://localhost:${PORT}/api/users/sync`);
        console.log(`📹 Meetings Endpoint: http://localhost:${PORT}/api/meetings`);
    });
}
startServer().catch((err) => {
    console.error("Failed to start server:", err);
});
