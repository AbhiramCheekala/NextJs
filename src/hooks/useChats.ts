import useSWR from "swr";
import useApiClient from "./useApiClient";
import { Chat } from "@/types/chat";
import logger from "@/lib/client-logger";
import { useState } from "react";
import { useDebounce } from "./useDebounce";

export const useChats = (
  assignedTo?: string,
  search?: string,
  canFetch = true
) => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const apiClient = useApiClient();
  const debouncedSearch = useDebounce(search, 500);

  const fetcher = async (url: string) => {
    try {
      const res = await apiClient(url, "GET");
      return res;
    } catch (err) {
      logger.error("Failed to fetch chats:", err);
      throw err;
    }
  };

  let url = `/api/chats?page=${page}&limit=${limit}`;
  if (assignedTo) {
    url += `&assignedTo=${assignedTo}`;
  }
  if (debouncedSearch) {
    url += `&search=${debouncedSearch}`;
  }

  const { data, error, isLoading, mutate } = useSWR<{
    chats: Chat[];
    total: number;
  }>(
    canFetch ? url : null,
    fetcher,
    { refreshInterval: 5000 } // Poll every 5 seconds
  );

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return {
    chats: data?.chats || [],
    loading: isLoading,
    error,
    refetch: mutate,
    page,
    setPage,
    totalPages,
  };
};
