import { getOutboxSummaryService } from "./service";

export async function getOutboxSummaryController() {
  return getOutboxSummaryService();
}
