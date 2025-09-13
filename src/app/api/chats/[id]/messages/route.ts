
import { NextRequest, NextResponse } from "next/server";
import { MessageController } from "./controller";

const messageController = new MessageController();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  return messageController.getMessages(req, params.id);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  return messageController.sendMessage(req, params.id);
}
