import axios from "axios";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

class WhatsApp {
  private api = axios.create({
    baseURL: `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}`,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });

  public sendMessage = async (to: string, message: object | string) => {
    try {
      const payload = {
        messaging_product: "whatsapp",
        to,
        type: typeof message === "string" ? "text" : "template",
        ...(typeof message === "string"
          ? { text: { body: message } }
          : { template: message }),
      };

      await this.api.post("/messages", payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error("Error sending message:", error.response?.data);
      } else {
        logger.error("Error sending message:", error);
      }
    }
  };
}

export const whatsapp = new WhatsApp();
