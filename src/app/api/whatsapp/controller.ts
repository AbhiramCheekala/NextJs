import { getTemplatesFromWABA } from "@/app/api/whatsapp/service";
import { NextRequest, NextResponse } from "next/server";

export const fetchAllTemplates = async (
  req: NextRequest
): Promise<NextResponse> => {
  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get("accessToken");
  const wabaId = searchParams.get("wabaId");

  if (!accessToken || !wabaId) {
    return NextResponse.json(
      { error: "Missing accessToken or wabaId" },
      { status: 400 }
    );
  }

  try {
    const templates = await getTemplatesFromWABA(accessToken, wabaId);
    return NextResponse.json({ templates }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};
