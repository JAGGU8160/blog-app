// server/src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool, testDbConnection } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Health check route
app.get("/api/health", async (req, res) => {
  try {
    const dbRes = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      time: dbRes.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "DB not responding" });
  }
});

// Placeholder routes (you will implement later)
app.get("/api/posts", (req, res) => {
  res.json({ message: "Posts list will come from PostgreSQL here" });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await testDbConnection();
});
