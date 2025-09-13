
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient";
import { Chat } from "@/types/chat";

export const useChats = (assignedTo?: string, canFetch = true) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(canFetch);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!canFetch) {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      setLoading(true);
      try {
        let url = "/api/chats";
        if (assignedTo) {
          url += `?assignedTo=${assignedTo}`;
        }
        const response = await apiRequest(url, "GET");
        setChats(response);
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [assignedTo, canFetch]);

  return { chats, loading, error };
};
