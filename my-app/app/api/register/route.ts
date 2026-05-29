import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      password,
      role,
      program,
    } = body;

    // Check if email already exists
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await pool.query(
      `
      INSERT INTO users
      (full_name, email, password, role, program)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        fullName,
        email,
        hashedPassword,
        role,
        program,
      ]
    );

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}