import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("BODY:", body);

    const { email, password, role } = body;

    const result = await pool.query(
      `
      INSERT INTO users (email, password, role)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [email, password, role]
    );

    console.log("INSERT SUCCESS:", result.rows);

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