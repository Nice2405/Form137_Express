import { Pool } from "pg";

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "FOUND" : "MISSING");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});