import { NextRequest, NextResponse } from "next/server";
import { TemplateKpiController } from "./controller";

const controller = new TemplateKpiController();

export async function GET(req: NextRequest) {
  return controller.getTemplateKpis(req);
}
