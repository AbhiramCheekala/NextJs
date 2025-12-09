import { useState, useEffect, useCallback, useRef } from "react";
import { apiRequest } from "@/lib/apiClient";
import { Message } from "@/types/chat";
import { useDebounce } from "./useDebounce";

const PAGE_SIZE = 50;

export const usePaginatedMessages = (
  chatId: string | null,
  onMessagesRead?: () => void
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchingRef = useRef(false);
  const chatIdRef = useRef(chatId);

  useEffect(() => {
    chatIdRef.current = chatId;
    // Reset state when chat ID changes
    setMessages([]);
    setHasMore(true);
    setIsLoading(true);
    fetchingRef.current = false;
  }, [chatId]);

  // Initial fetch
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const fetchInitialMessages = async () => {
      if (fetchingRef.current) return;

      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const url = `/api/chats/${chatId}/messages?limit=${PAGE_SIZE}`;
        const initialMessages: Message[] = await apiRequest(url, "GET");

        if (chatIdRef.current === chatId) {
          // Mark as read if there are unread messages
          const hasUnread = initialMessages.some(
            (m) => m.direction === "incoming" && m.status !== "read"
          );
          if (hasUnread) {
            await apiRequest(`/api/chats/${chatId}/read`, "POST");
            if (onMessagesRead) {
              onMessagesRead();
            }
          }

          setMessages(initialMessages);
          setHasMore(initialMessages.length === PAGE_SIZE);
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchInitialMessages();
  }, [chatId, onMessagesRead]);

  // Polling for new messages
  useEffect(() => {
    if (!chatId) return;

    const pollNewMessages = async () => {
      if (messages.length === 0) return;

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;

      const url = `/api/chats/${chatId}/messages?after=${encodeURIComponent(
        lastMessage.messageTimestamp
      )}`;

      try {
        const newMessages: Message[] = await apiRequest(url, "GET");
        if (newMessages.length > 0 && chatIdRef.current === chatId) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const filteredNew = newMessages.filter(
              (m) => !existingIds.has(m.id)
            );
            return [...prev, ...filteredNew];
          });
        }
      } catch (e) {
        console.error("Failed to poll for new messages:", e);
      }
    };

    const intervalId = setInterval(pollNewMessages, 3000);

    return () => clearInterval(intervalId);
  }, [chatId, messages]);

  const fetchMore = useCallback(async () => {
    if (!chatId || !hasMore || isFetchingMore || fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    setIsFetchingMore(true);

    const oldestMessage = messages[0];
    if (!oldestMessage) {
      setIsFetchingMore(false);
      fetchingRef.current = false;
      return;
    }

    try {
      const url = `/api/chats/${chatId}/messages?limit=${PAGE_SIZE}&before=${encodeURIComponent(
        oldestMessage.messageTimestamp
      )}`;
      const olderMessages: Message[] = await apiRequest(url, "GET");

      if (chatIdRef.current === chatId) {
        if (olderMessages.length < PAGE_SIZE) {
          setHasMore(false);
        }
        if (olderMessages.length > 0) {
          setMessages((prev) => [...olderMessages, ...prev]);
        }
      }
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsFetchingMore(false);
      fetchingRef.current = false;
    }
  }, [chatId, hasMore, isFetchingMore, messages]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    messages,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    fetchMore,
    addMessage,
  };
};
