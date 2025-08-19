const TOKEN = process.env.WHATSAPP_TOKEN!;
const WABA_ID = process.env.WABA_ID!;

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
