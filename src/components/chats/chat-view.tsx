import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect
} from "react";
import { apiRequest } from "@/lib/apiClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chat } from "@/types/chat";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useChatStatus } from "@/hooks/useChatStatus";
import { usePaginatedMessages } from "@/hooks/usePaginatedMessages";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Terminal, ArrowLeft, Loader2, Check, CheckCheck, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

interface ChatViewProps {
  chat: Chat | null;
  onBack: () => void;
  onMessageSent: () => void;
}

export function ChatView({
  chat,
  onBack,
  onMessageSent
}: ChatViewProps) {
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
    addMessage
  } = usePaginatedMessages(chat?.id ?? null);

  const listRef = useRef<HTMLDivElement>(null);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  const scrollRef = useRef({
    scrollHeight: 0,
    shouldStickToBottom: true
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isFetchingMore
        ) {
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
    const isAtBottom =
      scrollHeight - scrollTop - clientHeight < 1;

    scrollRef.current.shouldStickToBottom = isAtBottom;
  };

  const handleSendMessage = async (content?: string) => {
    if (!chat || isSending) return;

    const messageContent =
      typeof content === "string"
        ? content
        : newMessage;

    if (messageContent.trim() === "" && windowStatus === "open")
      return;

    setIsSending(true);
    scrollRef.current.shouldStickToBottom = true;

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
    setNewMessage(
      (prevInput) => prevInput + emojiData.emoji
    );
    setShowEmojiPicker(false);
  };

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b flex items-center shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-bold">
          {chat.contact.name}
        </h2>
      </div>

      {/* MESSAGES */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        {hasMore && (
          <div
            ref={observerTargetRef}
            className="h-10 flex justify-center items-center"
          >
            {isFetchingMore && (
              <Loader2 className="h-6 w-6 animate-spin" />
            )}
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
              className={`flex flex-col mb-2 ${message.direction === "outgoing"
                ? "items-end"
                : "items-start"
                }`}
            >
              <div
                className={`p-2 rounded-lg max-w-md ${message.direction === "outgoing"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
                  }`}
              >
                {message.content}
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                {format(
                  new Date(message.messageTimestamp),
                  "p"
                )}
                {message.direction === "outgoing" && (
                  <>
                    {message.status === "sent" && (
                      <Check className="h-3 w-3 ml-1 text-gray-500" />
                    )}
                    {message.status === "delivered" && (
                      <CheckCheck className="h-3 w-3 ml-1 text-gray-500" />
                    )}
                    {message.status === "read" && (
                      <CheckCheck className="h-3 w-3 ml-1 text-blue-500" />
                    )}
                    {message.status === "failed" && (
                      <XCircle className="h-3 w-3 ml-1 text-red-500" />
                    )}
                  </>
                )}
              </p>
            </div>
          ))
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 border-t relative shrink-0">
        {windowStatus === "loading" && (
          <div className="text-center">Loading chat status...</div>
        )}

        {windowStatus === "error" && (
          <div className="text-center text-red-500">
            Error fetching chat status.
          </div>
        )}

        {windowStatus === "closed" && (
          <>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Conversation Window Closed</AlertTitle>
              <AlertDescription>
                It has been more than 24 hours since the last user
                message. Send a template to restart the conversation.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() =>
                handleSendMessage("template:hello_world")
              }
              className="w-full mt-2"
              disabled={isSending}
            >
              {isSending
                ? "Sending..."
                : "Send 'hello_world' Template"}
            </Button>
          </>
        )}

        {windowStatus === "open" && (
          <div>
            <div className="flex flex-col sm:flex-row items-center">
              <Input
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(e.target.value)
                }
                placeholder="Type a message"
                className="flex-1"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}

              />

              <div className="flex mt-2 sm:mt-0 sm:ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setShowEmojiPicker(!showEmojiPicker)
                  }
                  disabled={isSending}
                >
                  <span role="img">😊</span>
                </Button>

                <Button
                  className="ml-2"
                  onClick={() => handleSendMessage()}
                  disabled={isSending}
                >
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
        )}
      </div>
    </div>
  );
}
