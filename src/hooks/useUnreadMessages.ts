// src/hooks/useUnreadMessages.ts
import { useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types/chat';

interface UnreadMessage extends Message {
  chat: {
    contact: {
      name: string;
    };
  };
}

export const useUnreadMessages = () => {
  const { toast } = useToast();
  const shownMessageIds = useRef(new Set<string>());

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const messages: UnreadMessage[] = await apiRequest('/api/chats/unread', 'GET');
        
        messages.forEach((message) => {
          if (!shownMessageIds.current.has(message.id)) {
            toast({
              title: `New message from ${message.chat.contact.name}`,
              description: message.content,
            });
            shownMessageIds.current.add(message.id);
          }
        });
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };

    const interval = setInterval(fetchUnread, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [toast]);
};
