import useSWR from "swr";
import useApiClient from "./useApiClient";
import { Chat } from "@/types/chat";
import logger from "@/lib/client-logger";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "./useDebounce";

export const useChats = (
  assignedTo?: string,
  search?: string,
  canFetch = true,
  showUnreadOnly = false
) => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const apiClient = useApiClient();
  const debouncedSearch = useDebounce(search, 500);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, showUnreadOnly]);

  const fetcher = async (url: string) => {
    try {
      return await apiClient(url, "GET");
    } catch (err) {
      logger.error("Failed to fetch chats:", err);
      throw err;
    }
  };

  // Build URL (without canFetch check)
  const baseUrl = useMemo(() => {
    let path = `/api/chats?page=${page}&limit=${limit}`;
    if (assignedTo) path += `&assignedTo=${assignedTo}`;
    if (debouncedSearch) path += `&search=${debouncedSearch}`;
    if (showUnreadOnly) path += `&showUnreadOnly=true`;
    return path;
  }, [page, assignedTo, debouncedSearch, showUnreadOnly]);

  // Only enable SWR when we are allowed to fetch
  const swrKey = canFetch ? baseUrl : null;

  // Only poll page 1
  const shouldPoll = page === 1 && canFetch;

  const { data, error, isValidating, mutate } = useSWR<{
    chats: Chat[];
    total: number;
    totalUnread: number;
  }>(swrKey, fetcher, {
    refreshInterval: shouldPoll ? 5000 : 0,
    // We already have polling, no need to also revalidate on focus
    revalidateOnFocus: false,
    revalidateIfStale: true,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  // 🔥 Only treat very first load as "loading"
  const loading = !data && !error;

  return {
    chats: data?.chats || [],
    totalUnread: data?.totalUnread ?? 0,
    loading,
    error,
    refetch: mutate,
    page,
    setPage,
    totalPages,
  };
};
