import { NextRequest, NextResponse } from "next/server";
import { WebhookService } from "./service";
import { WhatsAppWebhookBody } from "./types";
import logger from "@/lib/logger";

export class WebhookController {
  private webhookService: WebhookService;

  constructor() {
    this.webhookService = new WebhookService();
  }

  public async handleWebhookEvent(req: NextRequest) {
    try {
      const body = await req.json();
      logger.info("Received WhatsApp webhook event:", body);

      if (this.isWhatsAppWebhookBody(body)) {
        await this.webhookService.processWebhookEvent(body);
        console.log(body);
        return new NextResponse("OK", { status: 200 });
      } else {
        logger.warn("Invalid webhook event received:", body);
        return new NextResponse("Invalid Request", { status: 400 });
      }
    } catch (error) {
      logger.error("Error handling webhook event:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }

  private isWhatsAppWebhookBody(body: any): body is WhatsAppWebhookBody {
    return (
      body &&
      body.object === "whatsapp_business_account" &&
      Array.isArray(body.entry)
    );
  }
}
