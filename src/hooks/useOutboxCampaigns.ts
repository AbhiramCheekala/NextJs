
import useSWRInfinite from 'swr/infinite';
import { apiRequest } from '@/lib/apiClient';
import { useDebounce } from './useDebounce';

const PAGE_LIMIT = 10;

export const useOutboxCampaigns = (searchTerm: string, status: string) => {
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null; // reached the end
    const search = debouncedSearchTerm ? `&search=${debouncedSearchTerm}` : '';
    const statusFilter = status ? `&status=${status}` : '&status=completed,sent,failed';
    return `/api/campaigns/outbox?page=${pageIndex + 1}&limit=${PAGE_LIMIT}${search}${statusFilter}`;
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite(getKey, apiRequest, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  const campaigns = data ? [].concat(...data) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.length === 0;
  const hasReachedEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_LIMIT);

  return {
    campaigns,
    isLoading: isLoadingInitialData,
    isLoadingMore,
    isError: error,
    hasReachedEnd,
    isEmpty,
    loadMore: () => setSize(size + 1),
    refresh: mutate,
  };
};
