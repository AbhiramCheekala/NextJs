"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient";

// Define the types based on the API response
export interface Kpis {
  totalCampaigns: number;
  totalMessagesSent: number;
  totalRepliesReceived: number;
  replyRate: string;
}

export interface MessageStatus {
  status: string;
  count: number;
}

export interface CampaignPerformance {
  id: number;
  name: string;
  createdAt: string;
  messagesSent: number;
  repliesReceived: number;
}

export interface AnalyticsData {
  kpis: Kpis;
  messageStatusBreakdown: MessageStatus[];
  campaignPerformance: CampaignPerformance[];
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/api/analytics", "GET");
      setAnalytics(res.data);
    } catch (err) {
      logger.error("Failed to fetch analytics:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
