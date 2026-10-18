import { query, isDbConfigured } from "../config/db.js";
export async function runMigrations() {
    if (!isDbConfigured) {
        return;
    }
    console.log("🔄 [Neon DB] Checking and running schema migrations...");
    const createTablesSql = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      clerk_id VARCHAR(255) UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      image_url TEXT,
      plan VARCHAR(50) DEFAULT 'free',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Meetings table
    CREATE TABLE IF NOT EXISTS meetings (
      id SERIAL PRIMARY KEY,
      meeting_id VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      status VARCHAR(50) DEFAULT 'active',
      host_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
      passcode VARCHAR(100),
      require_passcode BOOLEAN DEFAULT false,
      waiting_room BOOLEAN DEFAULT true,
      mute_on_entry BOOLEAN DEFAULT false,
      duration INTEGER DEFAULT 45,
      scheduled_for TIMESTAMP WITH TIME ZONE,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Participants table
    CREATE TABLE IF NOT EXISTS participants (
      id SERIAL PRIMARY KEY,
      meeting_id VARCHAR(100) REFERENCES meetings(meeting_id) ON DELETE CASCADE,
      user_id VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      is_host BOOLEAN DEFAULT false,
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      left_at TIMESTAMP WITH TIME ZONE
    );

    -- Recordings table
    CREATE TABLE IF NOT EXISTS recordings (
      id VARCHAR(100) PRIMARY KEY,
      meeting_id VARCHAR(100),
      title VARCHAR(255) NOT NULL,
      duration VARCHAR(50),
      file_size VARCHAR(50),
      thumbnail TEXT,
      video_url TEXT,
      host_name VARCHAR(255),
      views INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- User settings table
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      blur_background BOOLEAN DEFAULT false,
      noise_suppression BOOLEAN DEFAULT true,
      hd_video BOOLEAN DEFAULT true,
      mirror_camera BOOLEAN DEFAULT true,
      email_reminders BOOLEAN DEFAULT true,
      browser_notifications BOOLEAN DEFAULT true,
      sound_alerts BOOLEAN DEFAULT true,
      theme VARCHAR(20) DEFAULT 'dark',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
    try {
        await query(createTablesSql);
        console.log("✅ [Neon DB] Database schema verified and up to date!");
    }
    catch (err) {
        console.error("❌ [Neon DB] Migration error:", err);
    }
}
