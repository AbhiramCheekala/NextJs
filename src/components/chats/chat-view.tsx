
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/apiClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chat, Message } from "@/types/chat";

interface ChatViewProps {
  chat: Chat | null;
}

export function ChatView({ chat }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (chat) {
      const fetchMessages = async () => {
        const response = await apiRequest(`/api/chats/${chat.id}/messages`, "GET");
        setMessages(response);
      };
      fetchMessages();
    }
  }, [chat]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !chat) return;

    const response = await apiRequest(`/api/chats/${chat.id}/messages`, "POST", {
      content: newMessage,
    });

    setMessages([...messages, response]);
    setNewMessage("");
  };

  if (!chat) {
    return <div className="flex-1 flex items-center justify-center">Select a chat to start messaging</div>;
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">{chat.contact.name}</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.direction === "outgoing" ? "justify-end" : ""
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                message.direction === "outgoing"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
          />
          <Button onClick={handleSendMessage} className="ml-2">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
