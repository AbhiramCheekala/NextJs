import { db } from "@/lib/db";
import { templates } from "@/lib/drizzle/schema/templates";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { name, category, language, body } = await req.json();

    // 1. Submit to Meta (WhatsApp Cloud API)
    const metaRes = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.WABA_ID}/message_templates`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
          language,
          components: [
            {
              type: "BODY",
              text: body,
            },
          ],
        }),
      }
    );

    const metaResponse = await metaRes.json();

    // 2. Determine status based on Meta response
    let status = "SUBMITTED";
    if (metaResponse?.error) {
      status = "FAILED";
    }

    // 3. Save locally in your DB
    const saved = await db.insert(templates).values({
      name,
      category,
      language,
      body,
      status,
    });

    return Response.json({
      message: `Template ${status === "FAILED" ? "not " : ""}submitted to Meta`,
      metaResponse,
      saved,
    });
  } catch (err) {
    console.error("Template creation error:", err);
    return new Response("Server error", { status: 500 });
  }
}

export async function GET() {
  try {
    const allTemplates = await db
      .select()
      .from(templates)
      .orderBy(templates.lastUpdated);
    return Response.json(allTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return new Response("Failed to fetch templates", { status: 500 });
  }
}
