import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "./service";
import jwt from "jsonwebtoken";
import logger from "@/lib/logger";

export class ChatController {
  private chatService = new ChatService();

  public getChats = async (req: NextRequest) => {
    try {
      const user = JSON.parse(req.headers.get("user")!) as {
        id: string;
        role: string;
      };
      const chats = await this.chatService.getChats(user);
      return NextResponse.json(chats);
    } catch (error) {
      logger.error("Error fetching chats:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };
}
