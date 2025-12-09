import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

import { eq, and } from "drizzle-orm";
import logger from "@/lib/logger";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("PARAMS:", params);

  const chatId = await params?.id;

  if (!chatId) {
    logger.error("Chat ID missing in request params");
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  logger.info(`Marking messages as read for chat ID: ${chatId}`);

  try {
    await db
      .update(chatMessages)
      .set({ status: "read" })
      .where(
        and(
          eq(chatMessages.chatId, chatId),
          eq(chatMessages.direction, "incoming"),
          eq(chatMessages.status, "pending")
        )
      );

    logger.info(`Messages marked as read for chat ID: ${chatId}`);

    return NextResponse.json(
      { success: true, message: "Messages marked as read" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error marking messages as read", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
