// server/src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { pool } from "../db.js"; 
import dotenv from "dotenv";
dotenv.config();

// If you don't already call dotenv.config() in src/index.js, do it there instead.
// import dotenv from "dotenv";
// dotenv.config();

// Always have some secret, even if env is missing
const JWT_SECRET = process.env.JWT_SECRET || "dev_fallback_secret_key";

console.log("MAIL ENV:", {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  from: process.env.EMAIL_FROM,
});


// Nodemailer transporter for OTP mails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

// Simple 6-digit OTP generator – defined ONCE
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ---------------- OTP: request + reset ----------------

export const requestPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const userResult = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.json({
        message: "If this email exists, an OTP has been sent.",
      });
    }

    const user = userResult.rows[0];

    const otp = generateOtp();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      "UPDATE users SET reset_otp = $1, reset_otp_expires = $2 WHERE id = $3",
      [otp, expires, user.id]
    );

    // OPTIONAL: keep log in dev for debugging
    console.log("OTP for", user.email, "=", otp);

    // ✅ send real email now
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your password reset OTP",
      text: `Hello ${user.name || ""},

Your OTP is ${otp}. It is valid for 10 minutes.

If you didn't request this, you can ignore this email.`,
    });

    return res.json({
      message: "OTP sent to your email if it exists in our system.",
    });
  } catch (err) {
    console.error("requestPasswordOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const userResult = await pool.query(
      "SELECT id, reset_otp, reset_otp_expires FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP or email" });
    }

    const user = userResult.rows[0];

    if (!user.reset_otp || !user.reset_otp_expires) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    const now = new Date();
    if (
      user.reset_otp !== otp ||
      new Date(user.reset_otp_expires).getTime() < now.getTime()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // IMPORTANT: your column is password_hash, not password
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, reset_otp = NULL, reset_otp_expires = NULL 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("resetPasswordWithOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- JWT + auth helpers ----------------

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// ---------------- Register / Login / Me ----------------

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const insertRes = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, password_hash]
    );

    const user = insertRes.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      message: "Registered successfully",
      user,
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required" });
    }

    const result = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    delete user.password_hash;

    return res.json({
      user,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
