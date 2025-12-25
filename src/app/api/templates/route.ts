import { db } from "@/lib/db";
import { templates } from "@/lib/drizzle/schema/templates";
import logger from "@/lib/logger";
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
      logger.error("Meta API error:", metaResponse.error);
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
      message: `Template ${status === "FAILED" ? "not " : ""}submitted to Meta`,
      metaResponse,
      saved,
    });
  } catch (err) {
    logger.error("Template creation error:", err);
    return new Response("Server error", { status: 500 });
  }
}

import { count, desc, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("search")?.trim();
    const offset = (page - 1) * limit;

    // -----------------------------
    // WHERE condition (case-insensitive LIKE)
    // -----------------------------
    const whereCondition = search
      ? sql`LOWER(${templates.name}) LIKE ${"%" + search.toLowerCase() + "%"}`
      : undefined;

    // -----------------------------
    // Total count
    // -----------------------------
    const [totalResult] = whereCondition
      ? await db
          .select({ value: count() })
          .from(templates)
          .where(whereCondition)
      : await db.select({ value: count() }).from(templates);

    const total = Number(totalResult.value);

    // -----------------------------
    // Fetch paginated data
    // -----------------------------
    // -----------------------------
    // Fetch paginated data (always apply limit and offset)
    // -----------------------------
    const rows = await db
      .select()
      .from(templates)
      .where(whereCondition)
      .orderBy(desc(templates.updatedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: rows,
      meta: {
        total,
        limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching templates:", error);
    return new Response("Failed to fetch templates", { status: 500 });
  }
}
