import { db } from "@/lib/db";
import * as AnalyticsModel from "./model";

export async function getAnalytics() {
  return await AnalyticsModel.getAnalytics(db);
}
