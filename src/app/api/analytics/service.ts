import { db } from "@/lib/db";
import * as AnalyticsModel from "./model";

export async function getAnalytics({ page, limit }: { page: number; limit: number }) {
  return await AnalyticsModel.getAnalytics(db, { page, limit });
}
