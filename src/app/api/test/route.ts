import { db } from "@/lib/db";
import { usersTable } from "@/lib/drizzle/schema/users";
import { NextResponse } from "next/server";
import { use } from "react";

export async function GET() {
  try {
    const data = await db.select().from(usersTable); // ✅ await the query
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
