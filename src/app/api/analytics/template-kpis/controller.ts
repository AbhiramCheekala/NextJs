import { NextRequest, NextResponse } from "next/server";
import { TemplateKpiService } from "./service";
import logger from "@/lib/logger";

export class TemplateKpiController {
  private templateKpiService = new TemplateKpiService();

  public getTemplateKpis = async (req: NextRequest) => {
    try {
      const kpis = await this.templateKpiService.getTemplateKpis();
      return NextResponse.json(kpis);
    } catch (error) {
      logger.error("Error fetching template KPIs:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  };
}
