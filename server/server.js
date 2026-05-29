require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role VARCHAR(50) NOT NULL,
      program VARCHAR(50) DEFAULT ''
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS requests (
      id SERIAL PRIMARY KEY,
      document_type VARCHAR(100),
      student_name VARCHAR(100),
      student_number VARCHAR(50),
      student_program VARCHAR(20),
      purpose TEXT,
      copies INTEGER DEFAULT 1,
      status VARCHAR(50) DEFAULT 'Pending Approval',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Form137 Express Backend Running ✅");
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role, program } = req.body;

    const existing = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users
      (full_name, email, password, role, program)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [fullName, email, hashedPassword, role, program]
    );

    res.json({
      message: "User registered successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    console.log("LOGIN_EMAIL", email, "ROW_COUNT", result.rows.length);

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        program: user.program,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// CREATE REQUEST
app.post("/requests", async (req, res) => {
  try {
    const {
      documentType,
      studentName,
      studentNumber,
      purpose,
      copies,
      studentProgram,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO requests
      (
        document_type,
        student_name,
        student_number,
        student_program,
        purpose,
        copies,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        documentType,
        studentName,
        studentNumber,
        studentProgram,
        purpose,
        copies,
        "Pending Approval",
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// GET ALL REQUESTS
app.get("/requests", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM requests ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// START SERVER
app.listen(process.env.PORT, "127.0.0.1", () => {
  console.log(
    `Server running on port ${process.env.PORT}`
  );
});