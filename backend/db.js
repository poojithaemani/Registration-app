import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

/**
 * PostgreSQL connection pool
 * Uses DATABASE_URL from environment for Render.com compatibility
 * Handles SSL/TLS for secure remote connections
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for self-signed certificates
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

// Test database connection on startup
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ PostgreSQL database connected successfully");
    console.log("   Current time from DB:", res.rows[0].now);
  }
});
