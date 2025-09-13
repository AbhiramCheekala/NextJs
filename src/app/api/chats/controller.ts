
import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "./service";
import jwt from "jsonwebtoken";

export class ChatController {
  private chatService = new ChatService();

  public getChats = async (req: NextRequest) => {
    try {
      const token = req.headers.get("authorization")?.split(" ")[1];
      if (!token) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      const user = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: string;
      };
      const chats = await this.chatService.getChats(user);
      return NextResponse.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };
}
