"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient";

// Define the types based on the API response
export interface Kpis {
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesReplied: number;
  messagesFailed: number;
}

export interface RecentCampaign {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

export interface ErrorFeedItem {
  id: string;
  content: string;
  error: string | null;
  timestamp: string;
}

export interface IncomingReply {
  id: string;
  content: string;
  timestamp: string;
  contactId: string;
}

export interface DashboardData {
  kpis: Kpis;
  recentCampaigns: RecentCampaign[];
  errorFeed: ErrorFeedItem[];
  incomingReplies: IncomingReply[];
}

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/api/dashboard", "GET");
      setDashboardData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    dashboardData,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}
