import { NextRequest, NextResponse } from "next/server";
import { MessageService } from "./service";
import logger from "@/lib/logger";

export class MessageController {
  private messageService = new MessageService();

  public getMessages = async (req: NextRequest, chatId: string) => {
    try {
      const { searchParams } = req.nextUrl;
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const before = searchParams.get("before") || undefined;
      const after = searchParams.get("after") || undefined;

      const messages = await this.messageService.getMessages(
        chatId,
        limit,
        before,
        after
      );
      return NextResponse.json(messages);
    } catch (error) {
      logger.error("Error fetching messages:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };

  public sendMessage = async (req: NextRequest, chatId: string) => {
    try {
      const body = await req.json();
      const message = await this.messageService.sendMessage(
        chatId,
        body.content
      );
      return NextResponse.json(message);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error sending message:", { message: error.message, stack: error.stack });
      } else {
        logger.error("Error sending message:", error);
      }
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };
}
