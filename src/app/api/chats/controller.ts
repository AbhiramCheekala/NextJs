
import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "./service";

export class ChatController {
  private chatService = new ChatService();

  public getChats = async (req: NextRequest) => {
    try {
      const chats = await this.chatService.getChats();
      return NextResponse.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };
}
