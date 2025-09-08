
import { MessageModel } from "./model";

export class MessageService {
  private messageModel = new MessageModel();

  public getMessages = async (chatId: string) => {
    return await this.messageModel.getMessages(chatId);
  };

  public sendMessage = async (chatId: string, content: string) => {
    return await this.messageModel.sendMessage(chatId, content);
  };
}
