import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("LOGIN BODY:", body);

    const { email, password } = body;

    console.log("LOGIN EMAIL:", email);

    const result = await pool.query(
      `
      SELECT * FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [email.trim()]
    );

    console.log("LOGIN RESULT:", result.rows);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user,
    });

  } catch (error) {
  console.error("LOGIN ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      message: "Server error",
      error: String(error),
    },
    { status: 500 }
  );
  }
}