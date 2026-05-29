import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password, role } = body;

    await pool.query(
      `
      INSERT INTO users (email, password, role)
      VALUES ($1, $2, $3)
      `,
      [email, password, role]
    );

    return NextResponse.json({
      success: true,
      message: "Registered successfully",
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 }
    );
  }
}