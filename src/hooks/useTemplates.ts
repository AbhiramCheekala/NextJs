"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient"; // adjust path

export interface Template {
  id: number;
  name: string;
  category: string;
  language: string;
}

export function useTemplates(searchTerm?: string) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTemplates = async (search?: string) => {
    setIsLoading(true);
    try {
      const url = search ? `/api/templates?search=${search}` : "/api/templates";
      const res = await apiRequest(url, "GET");
      console.log("Fetched templates:", res.data);
      setTemplates(res.data || []);
    } catch (err) {
      logger.error("Failed to fetch templates:", err);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTemplates(searchTerm);
    }, 300); // Debounce API calls

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return {
    templates,
    isLoading,
    refetch: fetchTemplates,
  };
}
