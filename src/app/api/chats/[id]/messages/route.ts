
import { NextRequest, NextResponse } from "next/server";
import { MessageController } from "./controller";

const messageController = new MessageController();

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  return messageController.getMessages(req, id);
}

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;
  return messageController.sendMessage(req, id);
}
