import { db } from "@/lib/db";
import { templates } from "@/lib/drizzle/schema/templates";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("WABA_ID:", process.env.WABA_ID);
    console.log("WHATSAPP_TOKEN:", process.env.WHATSAPP_TOKEN);

    console.log("WABA_ID:", process.env.WABA_ID);
    console.log("WHATSAPP_TOKEN:", process.env.WHATSAPP_TOKEN);

    console.log("WABA_ID:", process.env.WABA_ID);
    console.log("WHATSAPP_TOKEN:", process.env.WHATSAPP_TOKEN);

    // 1. Fetch templates from Meta (WhatsApp Cloud API)
    const metaRes = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.WABA_ID}/message_templates`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        },
      }
    );

    if (!metaRes.ok) {
      const errorData = await metaRes.json();
      logger.error("Meta API error:", errorData);
      return new NextResponse(
        JSON.stringify({
          message: "Failed to fetch templates from Meta",
          error: errorData,
        }),
        { status: metaRes.status }
      );
    }

    const { data } = await metaRes.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({
        message: "No templates found in Meta.",
        syncedCount: 0,
      });
    }

    let syncedCount = 0;

    // 2. Iterate and sync with local DB
    for (const template of data) {
      const existingTemplate = await db
        .select()
        .from(templates)
        .where(eq(templates.name, template.name))
        .limit(1);

      if (existingTemplate.length === 0) {
        // Template doesn't exist, so insert it
        await db.insert(templates).values({
          name: template.name,
          category: template.category,
          language: template.language,
          components: template.components,
          status: template.status,
        });
        syncedCount++;
      }
      // Optional: If template exists, you could update it here
    }

    return NextResponse.json({
      message: "Sync completed successfully.",
      syncedCount,
    });
  } catch (err) {
    logger.error("Template sync error:", err);
    let errorMessage = "Server error during sync";
    if (err instanceof TypeError && err.cause) {
      // @ts-ignore
      errorMessage = `Fetch failed: ${
        err.cause.code || err.cause.message || "Unknown cause"
      }`;
    }
    return new NextResponse(JSON.stringify({ message: errorMessage }), {
      status: 500,
    });
  }
}
