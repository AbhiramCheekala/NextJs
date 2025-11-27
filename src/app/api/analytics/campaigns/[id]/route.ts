import { NextRequest, NextResponse } from "next/server";
import { getCampaignKpisController } from "./controller";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    // ✅ Proper way to access dynamic route params
    const campaignId = Number(params.id);

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { success: false, message: "Invalid campaign id" },
        { status: 400 }
      );
    }

    const data = await getCampaignKpisController(campaignId);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Campaign KPI API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
