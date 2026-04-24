// db/index.js
// This file connects our app to PostgreSQL using the "pg" library
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Pool manages multiple database connections automatically
const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection when server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to PostgreSQL database");
    release(); // release the client back to the pool
  }
});

export default pool;
