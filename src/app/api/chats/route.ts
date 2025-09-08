
import { NextRequest, NextResponse } from "next/server";
import { ChatController } from "./controller";

const chatController = new ChatController();

export async function GET(req: NextRequest) {
  return chatController.getChats(req);
}
