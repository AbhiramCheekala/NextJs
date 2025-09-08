
"use client";

import { useState, useEffect } from "react";
import { useChats } from "@/hooks/useChats";
import { ChatList } from "@/components/chats/chat-list";
import { ChatView } from "@/components/chats/chat-view";
import { Chat } from "@/types/chat";

export default function ChatsPage() {
  const { chats, loading, error } = useChats();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="flex h-full">
      <ChatList chats={chats} onSelectChat={handleSelectChat} />
      <ChatView chat={selectedChat} />
    </div>
  );
}
