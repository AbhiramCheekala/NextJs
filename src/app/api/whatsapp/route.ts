import { fetchAllTemplates } from "@/app/api/whatsapp/controller";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return fetchAllTemplates(req);
}
