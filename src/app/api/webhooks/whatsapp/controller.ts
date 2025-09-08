import { NextRequest, NextResponse } from "next/server";
import { WebhookService } from "./service";

export class WebhookController {
  private webhookService = new WebhookService();

  public handleWebhookEvent = async (req: NextRequest) => {
    try {
      const body = await req.json();
      await this.webhookService.processWebhookEvent(body);
      return new NextResponse("OK", { status: 200 });
    } catch (error) {
      console.error("Error processing webhook event:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };
}