import { getCampaignKpisService } from "./service";

export const getCampaignKpisController = async (campaignId: number) => {
  if (!campaignId) throw new Error("Campaign ID is required");

  return await getCampaignKpisService(campaignId);
};
