import { getCampaignKpisRepo } from "./model";

export const getCampaignKpisService = async (campaignId: number) => {
  return await getCampaignKpisRepo(campaignId);
};
