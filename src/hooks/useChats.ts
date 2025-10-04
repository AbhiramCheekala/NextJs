import useSWR from 'swr';
import useApiClient from './useApiClient';
import { Chat } from '@/types/chat';
import logger from '@/lib/client-logger';

export const useChats = (assignedTo?: string, canFetch = true) => {
  const apiClient = useApiClient();

  const fetcher = async (url: string) => {
    try {
      const res = await apiClient(url, 'GET');
      return res;
    } catch (err) {
      logger.error("Failed to fetch chats:", err);
      throw err;
    }
  };

  let url = "/api/chats";
  if (assignedTo) {
    url += `?assignedTo=${assignedTo}`;
  }

  const { data, error, isLoading, mutate } = useSWR<Chat[]>(
    canFetch ? url : null,
    fetcher
  );

  return { chats: data || [], loading: isLoading, error, refetch: mutate };
};