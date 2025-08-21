import { db } from "@/lib/db";
import * as DashboardModel from "./model";

export async function getDashboardData() {
  return await DashboardModel.getDashboardData(db);
}
