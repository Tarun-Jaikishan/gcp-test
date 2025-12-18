import { NextResponse } from "next/server";

// POST -> /api
export async function GET() {
  return NextResponse.json(
    { status: true, message: "Hi there" },
    { status: 200 }
  );
}
