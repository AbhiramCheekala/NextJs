
import { ChatModel } from "./model";

export class ChatService {
  private chatModel = new ChatModel();

  public getChats = async (user: { id: string; role: string }) => {
    return await this.chatModel.getChats(user);
  };

  public getChatStatus = async (chatId: string) => {
    return await this.chatModel.getChatStatus(chatId);
  };
}
