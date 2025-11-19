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

export interface Pagination {
  page: number;
  limit: number;
  totalCampaigns: number;
  totalPages: number;
}

export interface AnalyticsData {
  kpis: Kpis;
  messageStatusBreakdown: MessageStatus[];
  campaignPerformance: CampaignPerformance[];
  pagination: Pagination;
}

export function useAnalytics(page = 1, limit = 10) {
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
    `/api/analytics?page=${page}&limit=${limit}`,
    fetcher
  );

  return {
    analytics: data,
    isLoading,
    error,
    refetch: mutate,
  };
}