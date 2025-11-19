import { NextRequest, NextResponse } from "next/server";
import { updatePasswordInController, updateUserPasswordController } from "../../controller";
import { authenticate } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Use the updateUserPasswordController for consistency and authentication
  return authenticate(updateUserPasswordController)(req, { params });
}

