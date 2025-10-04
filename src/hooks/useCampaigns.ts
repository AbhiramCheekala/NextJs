"use client";

import useSWR from 'swr';
import useApiClient from './useApiClient';
import logger from '@/lib/client-logger';

type Campaign = {
  id: number;
  name: string;
  templateId: number;
  status: "draft" | "sending" | "sent" | "failed";
  createdAt: string;
};

export function useCampaigns() {
  const apiClient = useApiClient();

  const fetcher = async (url: string) => {
    try {
      const res = await apiClient(url, 'GET');
      return res.data;
    } catch (err) {
      logger.error("Failed to fetch campaigns:", err);
      throw err;
    }
  };

  const { data, error, isLoading, mutate } = useSWR<Campaign[]>(
    '/api/campaigns',
    fetcher
  );

  return {
    campaigns: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}