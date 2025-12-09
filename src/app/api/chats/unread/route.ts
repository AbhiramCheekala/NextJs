import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages } from "@/lib/drizzle/schema/chatMessages";
import { and, eq, desc } from "drizzle-orm";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  logger.info("Fetching unread messages");

  try {
    const unreadMessages = await db.query.chatMessages.findMany({
      where: and(
        eq(chatMessages.direction, "incoming"),
        eq(chatMessages.status, "pending")
      ),
      with: {
        chat: {
          with: {
            contact: true,
          },
        },
      },
      orderBy: desc(chatMessages.createdAt),
    });

    logger.info(`Found ${unreadMessages.length} unread messages.`);
    return NextResponse.json(unreadMessages);
  } catch (error) {
    logger.error("Error fetching unread messages", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
