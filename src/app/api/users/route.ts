import { NextRequest, NextResponse } from "next/server";
import * as userController from "./controller";
import { authenticate } from "@/lib/auth"; // Import authenticate middleware

export async function GET(req: NextRequest) {
  return authenticate(userController.getAllUsers)(req);
}

export async function POST(req: NextRequest) {
  return authenticate(userController.createUser)(req);
}