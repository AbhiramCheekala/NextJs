import { NextResponse } from "next/server";
import { createBulkCampaignController } from "./controller";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await createBulkCampaignController(body);
    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating bulk campaign:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Failed to create bulk campaign", error: errorMessage },
      { status: 500 }
    );
  }
}
