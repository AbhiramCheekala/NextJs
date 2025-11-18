import { getCampaignSummaries } from "./model";

export async function getOutboxSummaryService() {
  const campaignSummaries = await getCampaignSummaries();

  return campaignSummaries.map((summary) => {
    const totalMessages = summary.sentCount + summary.failedCount + summary.pendingCount;
    const failureRate = totalMessages > 0 ? (summary.failedCount / totalMessages) * 100 : 0;
    const successRate = totalMessages > 0 ? (summary.sentCount / totalMessages) * 100 : 0;
    const progress = totalMessages > 0 ? ((summary.sentCount + summary.failedCount) / totalMessages) * 100 : 0;

    return {
      campaignId: summary.campaignId,
      campaignName: summary.campaignName,
      templateName: summary.templateName,
      totalMessages,
      sentCount: summary.sentCount,
      failedCount: summary.failedCount,
      pendingCount: summary.pendingCount,
      failureRate: parseFloat(failureRate.toFixed(2)),
      successRate: parseFloat(successRate.toFixed(2)),
      progress: parseFloat(progress.toFixed(2)),
      status: summary.status,
    };
  });
}
