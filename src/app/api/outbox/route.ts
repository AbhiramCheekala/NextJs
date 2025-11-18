import { NextResponse } from "next/server";
import { getOutboxSummaryController } from "./controller";

export async function GET() {
  try {
    const summary = await getOutboxSummaryController();
    return NextResponse.json(summary, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching outbox summary:", error);
    return NextResponse.json(
      { message: "Failed to fetch outbox summary", error: error.message },
      { status: 500 }
    );
  }
}
