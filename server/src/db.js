// server/src/db.js
import pg from "pg";

const { Pool } = pg;

// 🔴 TEMP: hard-coded connection for debugging
export const pool = new Pool({
  user: "postgres",      // your DB user
  host: "localhost",
  database: "blogdb",    // the DB you created in pgAdmin
  password: "root",      // the password you set for 'postgres'
  port: 5432,
});

export const testDbConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected at:", res.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err.message);
  }
};
