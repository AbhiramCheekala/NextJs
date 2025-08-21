import * as campaignController from "./controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await campaignController.createCampaign(req);
}

export async function GET(req: NextRequest) {
  return await campaignController.getAllCampaigns(req);
}
