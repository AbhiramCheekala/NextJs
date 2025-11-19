import { useState, useEffect, useCallback } from "react";
import useApiClient from "./useApiClient";
import { Chat } from "@/types/chat";
import logger from "@/lib/client-logger";
import { useDebounce } from "./useDebounce";

export const useChats = (
  assignedTo?: string,
  search?: string,
  canFetch = true
) => {
  const [page, setPage] = useState(1);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<any>(null);

  const limit = 20;
  const apiClient = useApiClient();
  const debouncedSearch = useDebounce(search, 500);

  const fetchChats = useCallback(
    async (pageNum: number, currentSearch: string | undefined) => {
      if (!canFetch) return;

      setLoading(true);
      setError(null);

      try {
        let url = `/api/chats?page=${pageNum}&limit=${limit}`;
        if (assignedTo) {
          url += `&assignedTo=${assignedTo}`;
        }
        if (currentSearch) {
          url += `&search=${currentSearch}`;
        }

        const res = await apiClient<{
          chats: Chat[];
          total: number;
        }>(url, "GET");

        setChats((prevChats) =>
          pageNum === 1 ? res.chats : [...prevChats, ...res.chats]
        );
        setHasMore(res.chats.length > 0 && res.chats.length === limit);
      } catch (err) {
        logger.error("Failed to fetch chats:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [apiClient, assignedTo, canFetch, limit]
  );

  // Effect for initial fetch and search changes
  useEffect(() => {
    setChats([]);
    setPage(1);
    setHasMore(true);
    fetchChats(1, debouncedSearch);
  }, [debouncedSearch, assignedTo, fetchChats]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchChats(nextPage, debouncedSearch);
  }, [loading, hasMore, page, fetchChats, debouncedSearch]);

  const refetch = () => {
    setChats([]);
    setPage(1);
    setHasMore(true);
    fetchChats(1, debouncedSearch);
  };

  return {
    chats,
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};
