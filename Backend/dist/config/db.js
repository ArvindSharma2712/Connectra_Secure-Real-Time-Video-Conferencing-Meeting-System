import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pg;
export const databaseUrl = process.env.DATABASE_URL || "";
export const isDbConfigured = Boolean(databaseUrl &&
    (databaseUrl.startsWith("postgres://") ||
        databaseUrl.startsWith("postgresql://")));
// Configure connection pool for Neon PostgreSQL
export const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isDbConfigured
        ? {
            rejectUnauthorized: false,
        }
        : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
// Database query helper
export async function query(text, params) {
    if (!isDbConfigured) {
        throw new Error("DATABASE_URL is not set. Please provide your Neon PostgreSQL connection string in Backend/.env");
    }
    return pool.query(text, params);
}
// Check database connection
export async function testDbConnection() {
    if (!isDbConfigured) {
        console.log("\x1b[33m%s\x1b[0m", "ℹ️  [Neon DB] DATABASE_URL is not configured in Backend/.env. Server running with in-memory fallback until Neon DB is connected.");
        return false;
    }
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT NOW() as current_time, current_database() as db_name");
        client.release();
        console.log("\x1b[32m%s\x1b[0m", `✅ [Neon DB] Successfully connected to Neon PostgreSQL database: "${result.rows[0].db_name}"`);
        return true;
    }
    catch (err) {
        const error = err;
        console.error("\x1b[31m%s\x1b[0m", `❌ [Neon DB] Connection failed: ${error.message}`);
        return false;
    }
}
