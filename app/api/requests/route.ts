import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM requests
      ORDER BY id DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET REQUESTS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await pool.query(
      `
      INSERT INTO requests
      (
        document_type,
        status,
        student_name,
        student_number,
        student_program,
        purpose,
        copies
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        body.documentType,
        "Pending Approval",
        body.studentName,
        body.studentNumber,
        body.studentProgram,
        body.purpose,
        body.copies,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("REQUEST ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create request" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const result = await pool.query(
      `
      UPDATE requests
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [
        body.status,
        body.id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE REQUEST ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update request" },
      { status: 500 }
    );
  }
}