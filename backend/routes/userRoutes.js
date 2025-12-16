import express from "express";
import { login, getAllUsers } from "../controllers/userController.js";

const router = express.Router();

/**
 * POST /api/login
 * User login endpoint - validates email and password
 * Returns user data with userid, email, and roleid
 */
router.post("/login", login);

/**
 * GET /api/users
 * Get all users endpoint - returns all users
 * For testing/debugging only - should be protected in production
 */
router.get("/users", getAllUsers);

export default router;
