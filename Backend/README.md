# Connectra Backend — PERN Stack API (PostgreSQL + Express + React + Node.js)

A high-performance RESTful backend API built with **Node.js, Express.js, TypeScript, and Neon Serverless PostgreSQL**.

---

## 🚀 Features

- **PERN Stack Architecture**: Built with Node.js and Express.js (strictly zero Python).
- **Neon Cloud PostgreSQL Integration**: Full support for Neon Serverless PostgreSQL with SSL connection pooling.
- **Auto-Migrations**: Automatic table schema initialization on startup (`users`, `meetings`, `participants`, `recordings`, `user_settings`).
- **User Management & Synchronization**: Automatically syncs user credentials and profiles from authentication (Clerk / Custom) into the Neon `users` table.
- **Meeting Management**: Create instant/scheduled meetings, generate meeting IDs, fetch details, manage participants, and track meeting statuses.
- **Fail-safe Dual Engine**: Operates with an in-memory fallback cache when `DATABASE_URL` is pending, and seamlessly transitions to live Neon PostgreSQL once credentials are provided.

---

## 🗄️ Database Schema (Neon PostgreSQL)

### `users`
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(255) PRIMARY KEY | Unique User Identifier / Auth ID |
| `clerk_id` | VARCHAR(255) UNIQUE | Clerk Authentication ID |
| `email` | VARCHAR(255) UNIQUE NOT NULL | User Email Address |
| `name` | VARCHAR(255) NOT NULL | Full Name |
| `first_name` | VARCHAR(255) | First Name |
| `last_name` | VARCHAR(255) | Last Name |
| `image_url` | TEXT | Avatar URL |
| `plan` | VARCHAR(50) DEFAULT 'free' | 'free', 'premium', 'business' |
| `created_at` | TIMESTAMPTZ | Creation Timestamp |
| `updated_at` | TIMESTAMPTZ | Last Updated Timestamp |

### `meetings`
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Numeric ID |
| `meeting_id` | VARCHAR(100) UNIQUE NOT NULL | Friendly 9-letter code (e.g. `zxc-vbn-mas`) |
| `title` | VARCHAR(255) NOT NULL | Meeting Title |
| `description` | TEXT | Agenda / Notes |
| `status` | VARCHAR(50) | 'active', 'scheduled', 'ended' |
| `host_id` | VARCHAR(255) REFERENCES users(id) | Meeting Creator |
| `duration` | INTEGER | Scheduled duration in minutes |
| `scheduled_for`| TIMESTAMPTZ | Planned date & time |
| `passcode` | VARCHAR(100) | Optional security passcode |
| `waiting_room` | BOOLEAN | Enable waiting room |
| `mute_on_entry`| BOOLEAN | Mute participants when entering |

---

## ⚙️ Connecting to Neon

1. Log into your [Neon Console](https://console.neon.tech).
2. Create or open your project and copy your **Postgres Connection String** (format: `postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require`).
3. Open [`Backend/.env`](file:///f:/Connectra%20-%20Video%20Metting%20platform/Backend/.env) and paste it:
   ```env
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. The server will automatically connect and create all tables for you!

---

## 📡 API Endpoints

### Health Check
- `GET /api/health` — Check server status & Neon DB connection

### Users
- `POST /api/users/sync` — Upsert user profile into Neon PostgreSQL
- `GET /api/users` — List all registered users
- `GET /api/users/:id` — Retrieve user profile by ID
- `PATCH /api/users/:id/plan` — Update subscription plan

### Meetings
- `GET /api/meetings` — List all meetings with host and participant info
- `POST /api/meetings` — Create instant or scheduled meeting
- `GET /api/meetings/:id` — Get meeting details by ID or code
- `PATCH /api/meetings/:id` — Update meeting status/details
- `DELETE /api/meetings/:id` — Delete a meeting
- `POST /api/meetings/:id/participants` — Register a participant joining

### Recordings & Stats
- `GET /api/recordings` — List conference recordings
- `GET /api/stats` — Real-time meeting and user statistics
