import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM notifications
      ORDER BY id DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}