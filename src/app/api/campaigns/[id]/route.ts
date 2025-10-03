import { NextRequest } from "next/server";
import * as campaignController from "../controller";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return await campaignController.getCampaignById(req, params.id);
}
