import * as contactModel from "@/app/api/contacts/model";
import * as campaignModel from "@/app/api/campaigns/model";
import { db } from "@/lib/db";
import logger from "@/lib/logger";

export async function processWebhook(payload: any) {
  // This is a placeholder for the actual webhook processing logic.
  // The structure of the payload will depend on your WhatsApp provider.
  // You will need to parse the payload to extract the sender's phone number and the message content.

  // Example payload structure from Meta:
  // {
  //   "object": "whatsapp_business_account",
  //   "entry": [
  //     {
  //       "id": "...",
  //       "changes": [
  //         {
  //           "value": {
  //             "messaging_product": "whatsapp",
  //             "metadata": { ... },
  //             "contacts": [ { ... } ],
  //             "messages": [ { ... } ]
  //           },
  //           "field": "messages"
  //         }
  //       ]
  //     }
  //   ]
  // }

  const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const from = message.from; // sender's phone number
    const content = message.text?.body;

    if (from && content) {
      let contact = await contactModel.getContactByPhone(from, db);

      if (!contact) {
        // If the contact doesn't exist, you might want to create it
        contact = await contactModel.createContact({
          phone: from,
          name: "Unknown", // You might want to get the name from the webhook payload if available
          email: `${from}@whatsapp.net`, // Placeholder email
        }, db);
        logger.info("Created new contact from webhook: %s", from);
      }

      await campaignModel.createMessage(
        {
          contactId: contact.id,
          content,
          direction: "incoming",
          status: "read", // Assuming the message is read when it's processed
        },
        db
      );

      logger.info("Processed incoming message from: %s", from);
    }
  }
}
