
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/apiClient';

export function useChatStatus(chatId: string | null) {
  const [status, setStatus] = useState<'loading' | 'open' | 'closed' | 'error'>('loading');

  useEffect(() => {
    if (!chatId) {
      setStatus('loading');
      return;
    }

    const fetchStatus = async () => {
      try {
        setStatus('loading');
        const response = await apiRequest(`/api/chats/${chatId}/status`, 'GET');
        setStatus(response.status);
      } catch (error) {
        console.error("Failed to fetch chat status:", error);
        setStatus('error');
      }
    };

    fetchStatus();
  }, [chatId]);

  return status;
}
