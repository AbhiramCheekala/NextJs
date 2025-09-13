"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient";

type Campaign = {
  id: number;
  name: string;
  templateId: number;
  status: "draft" | "sending" | "sent" | "failed";
  createdAt: string;
};

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest("/api/campaigns", "GET");
      setCampaigns(res.data);
    } catch (err) {
      logger.error("Failed to fetch campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    isLoading,
    refetch: fetchCampaigns,
  };
}
