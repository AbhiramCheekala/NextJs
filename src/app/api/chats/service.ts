
import { ChatModel } from "./model";

export class ChatService {
  private chatModel = new ChatModel();

  public getChats = async (user: { id: string; role: string }, page: number, limit: number, search?: string, assignedTo?: string) => {
    return await this.chatModel.getChats(user, page, limit, search, assignedTo);
  };

  public getChatStatus = async (chatId: string) => {
    return await this.chatModel.getChatStatus(chatId);
  };
}
