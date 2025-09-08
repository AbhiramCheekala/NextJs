
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient";

export const useChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await apiRequest("/api/chats", "GET");
        setChats(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return { chats, loading, error };
};
