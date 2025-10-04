"use client";

import useSWR from 'swr';
import useApiClient from './useApiClient';
import logger from '@/lib/client-logger';

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
  const apiClient = useApiClient();

  const fetcher = async (url: string) => {
    try {
      const res = await apiClient(url, 'GET');
      return res.data;
    } catch (err) {
      logger.error("Failed to fetch dashboard data:", err);
      throw err;
    }
  };

  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    '/api/dashboard',
    fetcher
  );

  return {
    dashboardData: data,
    isLoading,
    error,
    refetch: mutate,
  };
}