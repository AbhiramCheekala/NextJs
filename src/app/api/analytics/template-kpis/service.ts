import { TemplateKpiModel } from "./model";

export class TemplateKpiService {
  private templateKpiModel = new TemplateKpiModel();

  public getTemplateKpis = async () => {
    return await this.templateKpiModel.getTemplateKpis();
  };
}
