import { NextRequest, NextResponse } from "next/server";
import * as contactController from "@/app/api/contacts/controller";

export async function POST(req: NextRequest) {
  return await contactController.createBulkContacts(req);
}
