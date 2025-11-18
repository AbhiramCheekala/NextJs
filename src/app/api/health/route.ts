import { NextResponse } from "next/server";

export async function GET() {
  console.log("Health check OK");
  return NextResponse.json({ status: "ok" });
}
