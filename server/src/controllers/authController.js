// server/src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db.js";
import nodemailer from "nodemailer";


// Load env variables from .env
dotenv.config();

// Always have some secret, even if env is missing
const JWT_SECRET = process.env.JWT_SECRET || "dev_fallback_secret_key";

// Optional: to debug once, you can uncomment this:
// console.log("JWT_SECRET being used:", JWT_SECRET);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

export const requestPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const userResult = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal that user doesn't exist
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

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your password reset OTP",
      text: `Hello ${user.name || ""},\n\nYour OTP is ${otp}. It is valid for 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    });

    res.json({ message: "OTP sent to your email if it exists in our system." });
  } catch (err) {
    console.error("requestPasswordOtp error:", err);
    res.status(500).json({ message: "Server error" });
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

    await pool.query(
      `UPDATE users 
       SET password = $1, reset_otp = NULL, reset_otp_expires = NULL 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("resetPasswordWithOtp error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();


const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if email already exists
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

    res.status(201).json({
      message: "Registered successfully",
      user,
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message || "Server error" });
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

    res.json({
      user,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || "Server error" });
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

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
