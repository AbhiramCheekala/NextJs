
import { NextRequest, NextResponse } from "next/server";
import { WebhookController } from "./controller";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;
const webhookController = new WebhookController();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  return webhookController.handleWebhookEvent(req);
}
