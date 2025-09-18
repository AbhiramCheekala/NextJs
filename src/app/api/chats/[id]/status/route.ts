
import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "../../service";
import logger from "@/lib/logger";

const chatService = new ChatService();

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const status = await chatService.getChatStatus(id);
    return NextResponse.json(status);
  } catch (error) {
    logger.error("Error fetching chat status:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new NextResponse(JSON.stringify({ message: errorMessage }), { status: 500 });
  }
}
