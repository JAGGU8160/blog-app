// server/src/routes/postRoutes.js
import express from "express";
import {
  createPost,
  getAllPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  getMyPosts,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔒 protected routes FIRST where path is more specific
router.get("/me/mine", protect, getMyPosts);
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

// 🌍 public routes
router.get("/", getAllPosts);
router.get("/:slug", getPostBySlug);

export default router;
