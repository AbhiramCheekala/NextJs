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

interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    page: number;
    limit: number;
    totalCampaigns: number;
    totalPages: number;
  };
}

export function useCampaigns(page = 1, limit = 10, searchTerm = '') {
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

  const { data, error, isLoading, mutate } = useSWR<CampaignsResponse>(
    `/api/campaigns?page=${page}&limit=${limit}&search=${searchTerm}`,
    fetcher
  );

  return {
    campaigns: data?.campaigns || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch: mutate,
  };
}