
import { MessageModel } from "./model";

export class MessageService {
  private messageModel = new MessageModel();

  public getMessages = async (
    chatId: string,
    limit: number,
    before?: string,
    after?: string
  ) => {
    return await this.messageModel.getMessages(chatId, limit, before, after);
  };

  public sendMessage = async (chatId: string, content: string) => {
    return await this.messageModel.sendMessage(chatId, content);
  };
}
