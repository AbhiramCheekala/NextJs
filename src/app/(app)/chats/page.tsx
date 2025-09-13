
"use client";

import { useState, useEffect } from "react";
import { useChats } from "@/hooks/useChats";
import { ChatList } from "@/components/chats/chat-list";
import { ChatView } from "@/components/chats/chat-view";
import { Chat } from "@/types/chat";
import { User } from "@/lib/drizzle/schema/users";

export default function ChatsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | undefined>();
  const [canFetch, setCanFetch] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === "member") {
        setAssignedTo(parsedUser.id);
      }
      setCanFetch(true); // Enable fetching once user role is determined
    }
  }, []);

  // Pass `canFetch` to the hook to control execution
  const { chats, loading, error } = useChats(assignedTo, canFetch);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  // Update selected chat when chat list changes to avoid stale data
  useEffect(() => {
    if (chats.length > 0 && !chats.find((c) => c.id === selectedChat?.id)) {
      setSelectedChat(null);
    }
  }, [chats, selectedChat]);

  if (loading || !canFetch) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="flex h-full">
      <ChatList
        chats={chats}
        onSelectChat={handleSelectChat}
        userRole={user?.role}
        onFilterChange={setAssignedTo}
      />
      <ChatView chat={selectedChat} />
    </div>
  );
}
