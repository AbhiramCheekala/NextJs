"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useChats } from "@/hooks/useChats";
import { ChatList } from "@/components/chats/chat-list";
import { ChatView } from "@/components/chats/chat-view";
import { Chat } from "@/types/chat";
import { User } from "@/lib/drizzle/schema/users";

function Chats() {
  const [user, setUser] = useState<User | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [canFetch, setCanFetch] = useState(false);
  const [isChatViewVisible, setIsChatViewVisible] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === "member") {
        setAssignedTo(parsedUser.id);
      }
      setCanFetch(true);
    }
  }, []);

  const { chats, loading, error, page, setPage, totalPages, refetch } =
    useChats(assignedTo, searchTerm, canFetch);

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setIsChatViewVisible(true);
  };

  const handleBackToList = () => {
    setIsChatViewVisible(false);
    setSelectedChat(null);
  };

  useEffect(() => {
    if (chats.length > 0 && !chats.find((c) => c.id === selectedChat?.id)) {
      setSelectedChat(null);
    }
  }, [chats, selectedChat]);

  useEffect(() => {
    const contactId = searchParams.get("contact");
    if (contactId && chats.length > 0) {
      const chatToSelect = chats.find((chat) => chat.contactId === contactId);
      if (chatToSelect) {
        handleSelectChat(chatToSelect);
      }
    }
  }, [searchParams, chats]);

  if (loading || !canFetch) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* LEFT COLUMN — Chat List */}
      <div
        className={`w-[380px] border-r shrink-0 ${
          isChatViewVisible ? "hidden md:block" : ""
        }`}
      >
        <ChatList
          chats={chats}
          onSelectChat={handleSelectChat}
          userRole={user?.role}
          onFilterChange={setAssignedTo}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      </div>

      {/* RIGHT COLUMN — Chat View */}
      <div
        className={`flex-1 min-w-0 ${
          isChatViewVisible ? "block" : "hidden md:block"
        }`}
      >
        <ChatView
          chat={selectedChat}
          onBack={handleBackToList}
          onMessageSent={refetch}
        />
      </div>
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Chats />
    </Suspense>
  );
}
