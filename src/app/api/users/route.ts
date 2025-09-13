import { NextRequest, NextResponse } from "next/server";
import * as userController from "./controller";

export async function GET(req: NextRequest) {
  return await userController.getAllUsers(req);
}