"use client";

import useSWR from "swr";
import useApiClient from "@/hooks/useApiClient";
import logger from "@/lib/client-logger";

export interface CampaignAnalyticsData {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  repliesReceived: number;
  deliveryRate: string;
  replyRate: string;
}

export function useCampaignAnalytics(campaignId: number | null) {
  const apiClient = useApiClient();

  const fetcher = async (url: string) => {
    if (!campaignId) return null;
    try {
      const res = await apiClient(url, "GET");
      return res.data;
    } catch (err) {
      logger.error(
        `Failed to fetch analytics for campaign ${campaignId}:`,
        err
      );
      throw err;
    }
  };

  const { data, error, isLoading, mutate } = useSWR<CampaignAnalyticsData>(
    campaignId ? `/api/campaigns/${campaignId}/analytics` : null,
    fetcher
  );

  return {
    analytics: data,
    isLoading,
    error,
    refetch: mutate,
  };
}
