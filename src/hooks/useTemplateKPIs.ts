import useSWR from "swr";
import useApiClient from "./useApiClient";
import logger from "@/lib/client-logger";

export interface TemplateKpis {
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export const useTemplateKpis = () => {
  const apiClient = useApiClient();

  const fetcher = async (url: string) => {
    try {
      return await apiClient(url, "GET");
    } catch (err) {
      logger.error("Failed to fetch template KPIs:", err);
      throw err;
    }
  };

  const { data, error, isLoading } = useSWR<TemplateKpis>(
    "/api/analytics/template-kpis",
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    kpis: data,
    isLoading,
    error,
  };
};
