import { NextResponse } from "next/server";
import { AuthenticatedNextRequest } from "@/lib/auth"; // Import the custom type

export const requireAdmin = async (req: AuthenticatedNextRequest) => { // Use the custom type
  if (!req.user || req.user.role !== "admin") { // No more 'as any' needed
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }
  return null; // All good
};
