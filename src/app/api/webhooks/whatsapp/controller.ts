import { NextRequest, NextResponse } from "next/server";
import * as WebhookService from "./service";
import logger from "@/lib/logger";

export async function verifyWebhook(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    logger.info("Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  } else {
    logger.warn("Webhook verification failed");
    return new NextResponse(null, { status: 403 });
  }
}

export async function handleWebhook(req: NextRequest) {
  const body = await req.json();
  logger.info("Received webhook with body: %o", body);

  try {
    await WebhookService.processWebhook(body);
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    logger.error("Error processing webhook: %o", error);
    return new NextResponse(null, { status: 500 });
  }
}
