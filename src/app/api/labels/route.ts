// src/app/api/labels/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ labels: [] });
}
