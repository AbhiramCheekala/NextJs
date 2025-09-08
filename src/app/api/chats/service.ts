
import { ChatModel } from "./model";

export class ChatService {
  private chatModel = new ChatModel();

  public getChats = async () => {
    return await this.chatModel.getChats();
  };
}
