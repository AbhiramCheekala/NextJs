"use client";

import useSWR from 'swr';
import useApiClient from './useApiClient';
import logger from '@/lib/client-logger';

export interface Template {
  id: number;
  name: string;
  category: string;
  language: string;
}

export function useTemplates(searchTerm?: string) {
  const apiClient = useApiClient();

  const fetcher = async (url: string) => {
    try {
      const res = await apiClient(url, 'GET');
      return res.data;
    } catch (err) {
      logger.error("Failed to fetch templates:", err);
      throw err;
    }
  };

  const url = searchTerm ? `/api/templates?search=${searchTerm}` : "/api/templates";

  const { data, error, isLoading, mutate } = useSWR<Template[]>(
    url,
    fetcher
  );

  return {
    templates: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}