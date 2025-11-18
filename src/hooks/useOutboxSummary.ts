import useSWR from 'swr';
import { apiRequest } from '@/lib/apiClient';

export const useOutboxSummary = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/outbox', apiRequest);

  return {
    summary: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
};
