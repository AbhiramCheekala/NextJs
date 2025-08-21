import { db } from "@/lib/db";
import { templates } from "@/lib/drizzle/schema/templates";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { name, category, language, components } = await req.json();

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
          components,
        }),
      }
    );

    const metaResponse = await metaRes.json();

    // 2. Determine status based on Meta response
    let status = "SUBMITTED";
    if (metaResponse?.error) {
      status = "FAILED";
      console.error("Meta API error:", metaResponse.error);
    }

    // 3. Save locally in your DB
    const saved = await db.insert(templates).values({
      name,
      category,
      language,
      components,
      status,
    });

    return Response.json({
      message: `Template ${
        status === "FAILED" ? "not " : ""
      }submitted to Meta`,
      metaResponse,
      saved,
    });
  } catch (err) {
    console.error("Template creation error:", err);
    return new Response("Server error", { status: 500 });
  }
}

import { count, like } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    const whereCondition = search
      ? like(templates.name, `%${search}%`)
      : undefined;

    const [totalTemplates] = await db
      .select({ value: count() })
      .from(templates)
      .where(whereCondition);

    const allTemplates = await db
      .select()
      .from(templates)
      .where(whereCondition)
      .orderBy(templates.lastUpdated)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: allTemplates,
      meta: {
        total: totalTemplates.value,
        limit,
        currentPage: page,
        totalPages: Math.ceil(totalTemplates.value / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return new Response("Failed to fetch templates", { status: 500 });
  }
}
