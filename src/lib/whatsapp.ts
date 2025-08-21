const TOKEN = process.env.WHATSAPP_TOKEN!;
const WABA_ID = process.env.WABA_ID!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

/**
 * You need to add the following environment variables to your .env file:
 *
 * WHATSAPP_TOKEN=Your_Meta_Permanent_Access_Token
 * WABA_ID=Your_WhatsApp_Business_Account_ID
 * WHATSAPP_PHONE_NUMBER_ID=Your_Sending_Phone_Number_ID
 *
 * To receive replies, you also need to set up a webhook:
 * WHATSAPP_WEBHOOK_VERIFY_TOKEN=Your_Webhook_Verify_Token
 *
 */


export async function getTemplatesFromMeta() {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${WABA_ID}/message_templates`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch templates from Meta");

  const data = await res.json();
  return data.data; // List of templates
}

export async function getSingleTemplateStatus(name: string) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${WABA_ID}/message_templates?name=${name}`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    }
  );

  const data = await res.json();
  return data.data?.[0] || null;
}

// This is the real implementation for sending a message via Meta's API
export async function sendMessage(
  to: string,
  template: { name: string; language: string; components?: any[] }
) {
  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "template",
    template: {
      name: template.name,
      language: {
        code: template.language,
      },
      components: template.components,
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Failed to send message:", errorData);
    throw new Error(`Failed to send message: ${JSON.stringify(errorData)}`);
  }

  const data = await res.json();
  return data;
}

/**
 * To receive replies, you need to set up a webhook with your WhatsApp provider.
 * The webhook URL should point to:
 * https://<your-domain>/api/webhooks/whatsapp
 *
 * You should also add the following environment variable to your .env file:
 *
 * # This is a secret token that you configure with your WhatsApp provider to secure your webhook
 * WHATSAPP_WEBHOOK_VERIFY_TOKEN=
 *
 */
