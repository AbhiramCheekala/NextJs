
import { ChatModel } from "./model";

export class ChatService {
  private chatModel = new ChatModel();

  public getChats = async (user: { id: string; role: string }) => {
    return await this.chatModel.getChats(user);
  };
}
