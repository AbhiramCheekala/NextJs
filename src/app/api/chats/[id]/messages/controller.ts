import { NextRequest, NextResponse } from "next/server";
import { MessageService } from "./service";
import logger from "@/lib/logger";

export class MessageController {
  private messageService = new MessageService();

  public getMessages = async (req: NextRequest, chatId: string) => {
    try {
      const messages = await this.messageService.getMessages(chatId);
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
