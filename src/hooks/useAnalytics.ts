"use client";

import useSWR from 'swr';
import useApiClient from './useApiClient';
import logger from '@/lib/client-logger';

// Define the types based on the API response
export interface Kpis {
  totalCampaigns: number;
  totalMessagesSent: number;
  totalRepliesReceived: number;
  replyRate: string;
}

export interface MessageStatus {
  status: string;
  count: number;
}

export interface CampaignPerformance {
  id: number;
  name: string;
  createdAt: string;
  messagesSent: number;
  repliesReceived: number;
}

export interface AnalyticsData {
  kpis: Kpis;
  messageStatusBreakdown: MessageStatus[];
  campaignPerformance: CampaignPerformance[];
}

export function useAnalytics() {
  const apiClient = useApiClient();

  const fetcher = async (url: string) => {
    try {
      const res = await apiClient(url, 'GET');
      return res.data;
    } catch (err) {
      logger.error("Failed to fetch analytics:", err);
      throw err;
    }
  };

  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    '/api/analytics',
    fetcher
  );

  return {
    analytics: data,
    isLoading,
    error,
    refetch: mutate,
  };
}