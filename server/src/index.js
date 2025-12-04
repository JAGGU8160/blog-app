// server/src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool, testDbConnection } from "./db.js";
import multer from "multer";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// serve static files from /uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));


app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

app.post("/api/upload", protect, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

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
