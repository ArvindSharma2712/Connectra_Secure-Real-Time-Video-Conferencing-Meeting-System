import { Request, Response } from "express";
import { query, isDbConfigured } from "../config/db.js";

// In-memory store fallback when DATABASE_URL is not yet configured
const inMemoryUsers = new Map<string, any>();

export const userController = {
  // Sync / Upsert User into Neon PostgreSQL
  async syncUser(req: Request, res: Response) {
    try {
      const {
        id,
        clerkId,
        email,
        name,
        firstName,
        lastName,
        imageUrl,
        plan = "free",
      } = req.body;

      if (!id || !email || !name) {
        return res.status(400).json({
          error: "Missing required user fields: id, email, and name are required",
        });
      }

      if (isDbConfigured) {
        const sql = `
          INSERT INTO users (id, clerk_id, email, name, first_name, last_name, image_url, plan, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT (id) DO UPDATE SET
            clerk_id = COALESCE(EXCLUDED.clerk_id, users.clerk_id),
            name = EXCLUDED.name,
            first_name = COALESCE(EXCLUDED.first_name, users.first_name),
            last_name = COALESCE(EXCLUDED.last_name, users.last_name),
            email = EXCLUDED.email,
            image_url = COALESCE(EXCLUDED.image_url, users.image_url),
            plan = COALESCE(users.plan, EXCLUDED.plan),
            updated_at = NOW()
          RETURNING *;
        `;

        const result = await query(sql, [
          id,
          clerkId || id,
          email,
          name,
          firstName || null,
          lastName || null,
          imageUrl || null,
          plan,
        ]);

        const dbUser = result.rows[0];
        console.log(`👤 [Neon DB] User synchronized successfully: ${dbUser.email} (${dbUser.id})`);

        return res.json({
          success: true,
          source: "neon-postgres",
          user: {
            id: dbUser.id,
            clerkId: dbUser.clerk_id,
            email: dbUser.email,
            name: dbUser.name,
            firstName: dbUser.first_name,
            lastName: dbUser.last_name,
            imageUrl: dbUser.image_url,
            plan: dbUser.plan,
            createdAt: dbUser.created_at,
            updatedAt: dbUser.updated_at,
          },
        });
      } else {
        // Fallback store
        const userData = {
          id,
          clerkId: clerkId || id,
          email,
          name,
          firstName,
          lastName,
          imageUrl,
          plan,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        inMemoryUsers.set(id, userData);
        return res.json({
          success: true,
          source: "in-memory-fallback",
          user: userData,
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error syncing user:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // Get User Profile by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (isDbConfigured) {
        const result = await query(
          "SELECT * FROM users WHERE id = $1 OR clerk_id = $1 LIMIT 1",
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "User not found in Neon database" });
        }

        const dbUser = result.rows[0];
        return res.json({
          id: dbUser.id,
          clerkId: dbUser.clerk_id,
          email: dbUser.email,
          name: dbUser.name,
          firstName: dbUser.first_name,
          lastName: dbUser.last_name,
          imageUrl: dbUser.image_url,
          plan: dbUser.plan,
          createdAt: dbUser.created_at,
          updatedAt: dbUser.updated_at,
        });
      } else {
        const user = inMemoryUsers.get(id);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        return res.json(user);
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },

  // Get all users
  async getAllUsers(_req: Request, res: Response) {
    try {
      if (isDbConfigured) {
        const result = await query("SELECT * FROM users ORDER BY created_at DESC LIMIT 50");
        return res.json({
          source: "neon-postgres",
          count: result.rows.length,
          users: result.rows.map((u) => ({
            id: u.id,
            clerkId: u.clerk_id,
            email: u.email,
            name: u.name,
            firstName: u.first_name,
            lastName: u.last_name,
            imageUrl: u.image_url,
            plan: u.plan,
            createdAt: u.created_at,
          })),
        });
      } else {
        return res.json({
          source: "in-memory-fallback",
          count: inMemoryUsers.size,
          users: Array.from(inMemoryUsers.values()),
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },

  // Update subscription plan
  async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { plan } = req.body;

      if (!["free", "premium", "business"].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan: must be 'free', 'premium', or 'business'" });
      }

      if (isDbConfigured) {
        const result = await query(
          "UPDATE users SET plan = $1, updated_at = NOW() WHERE id = $2 OR clerk_id = $2 RETURNING *",
          [plan, id]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        return res.json({ success: true, user: result.rows[0] });
      } else {
        const user = inMemoryUsers.get(id);
        if (!user) return res.status(404).json({ error: "User not found" });
        user.plan = plan;
        user.updatedAt = new Date().toISOString();
        return res.json({ success: true, user });
      }
    } catch (err: unknown) {
      const error = err as Error;
      return res.status(500).json({ error: error.message });
    }
  },
};
