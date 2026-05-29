import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    console.log("REGISTER ROUTE HIT");

    const body = await req.json();

    console.log("BODY:", body);

    const {
      fullName,
      email,
      password,
      role,
      program,
    } = body;

    const result = await pool.query(
      `
      INSERT INTO users
      (full_name, email, password, role, program)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [fullName, email, password, role, program]
    );

    console.log("USER INSERTED:", result.rows);

    return NextResponse.json({
      success: true,
      message: "Registered successfully",
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}