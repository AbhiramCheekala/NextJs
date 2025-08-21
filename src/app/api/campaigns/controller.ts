import { NextRequest, NextResponse } from "next/server";
import * as CampaignService from "./service";
import logger from "@/lib/logger";

export async function createCampaign(req: NextRequest) {
  const body = await req.json();
  logger.info("Creating new campaign with data: %o", body);

  const { templateId, contactIds, name, templateVariables } = body;

  if (!templateId || !contactIds || !name) {
    return NextResponse.json(
      { error: "templateId, contactIds, and name are required" },
      { status: 400 }
    );
  }

  try {
    const campaign = await CampaignService.createCampaignAndSendMessages(
      name,
      templateId,
      contactIds,
      templateVariables
    );
    logger.info("Campaign created successfully with ID: %s", campaign.id);
    return NextResponse.json({ status: "success", data: campaign });
  } catch (error) {
    const err = error as Error;
    logger.error("An unexpected error occurred during campaign creation", {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      requestBody: body,
    });
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

export async function getAllCampaigns(req: NextRequest) {
  try {
    const campaigns = await CampaignService.getAllCampaigns();
    return NextResponse.json({ status: "success", data: campaigns });
  } catch (error) {
    logger.error("Error fetching campaigns: %o", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
