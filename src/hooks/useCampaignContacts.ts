"use client";

import useSWR from 'swr';
import useApiClient from './useApiClient';
import logger from '@/lib/client-logger';

type CampaignContact = {
  id: number;
  campaignId: number;
  name: string;
  whatsappNumber: string;
  status: string;
};

interface CampaignContactsResponse {
  contacts: CampaignContact[];
  pagination: {
    page: number;
    limit: number;
    totalContacts: number;
    totalPages: number;
  };
}

export function useCampaignContacts(campaignId: number | null, page = 1, limit = 6) {
  const apiClient = useApiClient();

  const fetcher = async (url: string) => {
    try {
      const res = await apiClient(url, 'GET');
      return res; // The whole response object from the API
    } catch (err) {
      logger.error("Failed to fetch campaign contacts:", err);
      throw err;
    }
  };

  const { data, error, isLoading, mutate } = useSWR<CampaignContactsResponse>(
    campaignId ? `/api/campaigns/${campaignId}/contacts?page=${page}&limit=${limit}` : null,
    fetcher
  );

  return {
    contacts: data?.contacts || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch: mutate,
  };
}
