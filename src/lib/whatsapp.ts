import axios from "axios";
import logger from "./logger";
import { db } from "./db";
import { chatMessages } from "./drizzle/schema/chatMessages";

const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

class WhatsApp {
  private api = axios.create({
    baseURL: `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}`,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  public sendMessage = async (
    to: string,
    message: object | string,
    chatId?: string
  ) => {
    try {
      const payload = {
        messaging_product: "whatsapp",
        to,
        type: typeof message === "string" ? "text" : "template",
        ...(typeof message === "string"
          ? { text: { body: message } }
          : { template: message }),
      };

      const response = await this.api.post("/messages", payload);

      console.log("WhatsApp API response:", response.data);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("WhatsApp API Error Response:", JSON.stringify(error.response?.data, null, 2));
        logger.error(
          "WhatsApp API Error:",
          error.response?.data || error.message
        );
      } else {
        logger.error("Error sending message:", {
          message: (error as Error).message,
          stack: (error as Error).stack,
        });
      }
      throw error;
    }
  };
}

export const whatsapp = new WhatsApp();
