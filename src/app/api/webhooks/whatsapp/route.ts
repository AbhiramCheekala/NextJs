import * as webhookController from "./controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await webhookController.handleWebhook(req);
}

export async function GET(req: NextRequest) {
  return await webhookController.verifyWebhook(req);
}
