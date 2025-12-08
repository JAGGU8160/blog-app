// server/src/controllers/postController.js
import { pool } from "../db.js";
import slugify from "slugify";

/**
 * Create a new blog post for the authenticated user.
 */
export const createPost = async (req, res) => {
  try {
    const { title, content, imageUrl, category } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const normalizedTitle = title.trim();
    const normalizedCategory = category?.trim() || "General";

    const slug =
      slugify(normalizedTitle, { lower: true, strict: true }) +
      "-" +
      Date.now();

    const result = await pool.query(
      `INSERT INTO posts (user_id, title, slug, content, image_url, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, normalizedTitle, slug, content, imageUrl || null, normalizedCategory]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create post error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all posts, newest first, with author name.
 */
export const getAllPosts = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.name AS author 
       FROM posts
       JOIN users ON users.id = posts.user_id
       ORDER BY posts.created_at DESC`
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Get posts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get a single post by its slug.
 */
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `SELECT posts.*, users.name AS author 
       FROM posts
       JOIN users ON users.id = posts.user_id
       WHERE posts.slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Get post error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update a post (only by its owner).
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, imageUrl, category } = req.body;

    const existing = await pool.query(
      `SELECT id, user_id, title, content, image_url, slug, category 
       FROM posts WHERE id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = existing.rows[0];
    if (post.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this post" });
    }

    const newTitle = title?.trim() || post.title;
    const newContent = content ?? post.content;
    const newImageUrl =
      imageUrl !== undefined ? imageUrl : post.image_url;
    const newCategory = category?.trim() || post.category;

    const result = await pool.query(
      `UPDATE posts
       SET title = $1,
           content = $2,
           image_url = $3,
           category = $4
       WHERE id = $5
       RETURNING *`,
      [newTitle, newContent, newImageUrl, newCategory, id]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update post error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete a post (only by its owner).
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Post not found or not yours" });
    }

    return res.json({ message: "Post deleted", id: result.rows[0].id });
  } catch (err) {
    console.error("Delete post error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get posts for the currently authenticated user.
 */
export const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT posts.*, users.name AS author
       FROM posts
       JOIN users ON users.id = posts.user_id
       WHERE posts.user_id = $1
       ORDER BY posts.created_at DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Get my posts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
