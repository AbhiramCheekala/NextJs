import { WebhookModel } from "./model";

export class WebhookService {
  private webhookModel = new WebhookModel();

  public processWebhookEvent = async (body: any) => {
    // Implement logic to process webhook event
    // For example, save incoming messages to the database
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const msg = body.entry[0].changes[0].value.messages[0];
        await this.webhookModel.saveMessage(msg);
      }
    }
  };
}