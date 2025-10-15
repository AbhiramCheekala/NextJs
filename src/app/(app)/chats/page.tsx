
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
  const [isChatViewVisible, setIsChatViewVisible] = useState(false);

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
    setIsChatViewVisible(true);
  };

  const handleBackToList = () => {
    setIsChatViewVisible(false);
    setSelectedChat(null);
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
      <div
        className={`w-full md:w-1/4 border-r ${
          isChatViewVisible ? "hidden md:block" : ""
        }`}
      >
        <ChatList
          chats={chats}
          onSelectChat={handleSelectChat}
          userRole={user?.role}
          onFilterChange={setAssignedTo}
        />
      </div>
      <div
        className={`flex-1 ${isChatViewVisible ? "block" : "hidden md:block"}`}
      >
        <ChatView chat={selectedChat} onBack={handleBackToList} />
      </div>
    </div>
  );
}
