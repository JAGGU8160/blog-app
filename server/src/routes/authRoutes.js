// server/src/routes/authRoutes.js
import express from "express";
import { register, login, getMe ,requestPasswordOtp,resetPasswordWithOtp} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";



const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me (requires token)
router.get("/me", protect, getMe);
router.post("/password-otp", requestPasswordOtp);
router.post("/reset-password", resetPasswordWithOtp);

export default router;
