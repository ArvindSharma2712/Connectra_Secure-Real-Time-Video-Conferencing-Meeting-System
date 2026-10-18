import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { getNeonUsers } from "../lib/neon.js";
export const userRoutes = Router();
// POST /api/users/sync - Store / update user information in Neon PostgreSQL
userRoutes.post("/sync", userController.syncUser);
// GET /api/users/neon-data - Test querying Neon Data API directly
userRoutes.get("/neon-data", async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const result = await getNeonUsers(token);
    res.json(result);
});
// GET /api/users - Get all users
userRoutes.get("/", userController.getAllUsers);
// GET /api/users/:id - Get user profile
userRoutes.get("/:id", userController.getUserById);
// PATCH /api/users/:id/plan - Update subscription plan
userRoutes.patch("/:id/plan", userController.updatePlan);
