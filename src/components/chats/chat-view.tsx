import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { apiRequest } from "@/lib/apiClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chat, Message } from "@/types/chat";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useChatStatus } from "@/hooks/useChatStatus";
import { usePaginatedMessages } from "@/hooks/usePaginatedMessages";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ChatViewProps {
  chat: Chat | null;
  onBack: () => void;
  onMessageSent: () => void;
}

export function ChatView({ chat, onBack, onMessageSent }: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const windowStatus = useChatStatus(chat?.id ?? null);
  
  const {
    messages,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchMore,
    addMessage,
  } = usePaginatedMessages(chat?.id ?? null);

  const listRef = useRef<HTMLDivElement>(null);
  const observerTargetRef = useRef<HTMLDivElement>(null);
  
  // Ref to store scroll state
  const scrollRef = useRef({
    scrollHeight: 0,
    shouldStickToBottom: true,
  });

  // Effect for infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          // Preserve scroll position before fetching more
          const list = listRef.current;
          if (list) {
            scrollRef.current.scrollHeight = list.scrollHeight;
            scrollRef.current.shouldStickToBottom = false;
          }
          fetchMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTargetRef.current) {
      observer.observe(observerTargetRef.current);
    }
    return () => {
      if (observerTargetRef.current) {
        observer.unobserve(observerTargetRef.current);
      }
    };
  }, [hasMore, isFetchingMore, fetchMore]);

  // Main layout effect for scroll management
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    if (scrollRef.current.shouldStickToBottom) {
      list.scrollTop = list.scrollHeight;
    } else {
      const newScrollHeight = list.scrollHeight;
      const oldScrollHeight = scrollRef.current.scrollHeight;
      if (newScrollHeight > oldScrollHeight) {
        list.scrollTop += newScrollHeight - oldScrollHeight;
      }
    }
  }, [messages]);

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const { scrollTop, scrollHeight, clientHeight } = list;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 1;
    scrollRef.current.shouldStickToBottom = isAtBottom;
  };

  const handleSendMessage = async (content?: string) => {
    if (!chat || isSending) return;

    const messageContent = typeof content === "string" ? content : newMessage;
    if (messageContent.trim() === "" && windowStatus === "open") return;

    setIsSending(true);
    scrollRef.current.shouldStickToBottom = true; // Stick to bottom after sending

    try {
      const response = await apiRequest(
        `/api/chats/${chat.id}/messages`,
        "POST",
        { content: messageContent }
      );
      
      addMessage(response);
      setNewMessage("");
      onMessageSent();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prevInput) => prevInput + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  
  const renderChatInput = () => {
    switch (windowStatus) {
      case "loading":
        return <div className="p-4 text-center">Loading chat status...</div>;
      case "error":
        return (
          <div className="p-4 text-center text-red-500">
            Error fetching chat status.
          </div>
        );
      case "closed":
        return (
          <div className="p-4 border-t bg-gray-50">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Conversation Window Closed</AlertTitle>
              <AlertDescription>
                It has been more than 24 hours since the last user message. Send
                a template to restart the conversation.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => handleSendMessage("template:hello_world")}
              className="w-full mt-2"
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send 'hello_world' Template"}
            </Button>
          </div>
        );
      case "open":
        return (
          <div className="p-4 border-t relative">
            <div className="flex flex-col sm:flex-row items-center">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1"
                disabled={isSending}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <div className="flex mt-2 sm:mt-0 sm:ml-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    disabled={isSending}
                >
                    <span role="img" aria-label="emoji">😊</span>
                </Button>
                <Button onClick={() => handleSendMessage()} className="ml-2" disabled={isSending}>
                    {isSending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 z-10">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
        );
    }
  };

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b flex items-center">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-bold">{chat.contact.name}</h2>
      </div>
      <div ref={listRef} onScroll={handleScroll} className="flex-1 p-4 overflow-y-auto hide-scrollbar">
        
        {hasMore && (
          <div ref={observerTargetRef} className="h-10 flex justify-center items-center">
            {isFetchingMore && <Loader2 className="h-6 w-6 animate-spin" />}
          </div>
        )}

        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col mb-2 ${
                message.direction === "outgoing" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`p-2 rounded-lg max-w-md ${
                  message.direction === "outgoing"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {message.content}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(message.messageTimestamp), "p")}
              </p>
            </div>
          ))
        )}
      </div>
      {renderChatInput()}
    </div>
  );
}


