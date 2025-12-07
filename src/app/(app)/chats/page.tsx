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
  const [canFetch, setCanFetch] = useState<boolean>(false);
  const [isChatViewVisible, setIsChatViewVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const searchParams = useSearchParams();
  const contactId = searchParams.get("contact") || undefined;

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        if (parsedUser.role === "member") {
          setAssignedTo(parsedUser.id);
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }

    setCanFetch(true);
  }, []);

  const { chats, loading, error, page, setPage, totalPages, refetch } =
    useChats(assignedTo, searchTerm, canFetch);

  const handleSelectChat = (chat: Chat) => {
    // Avoid setting same chat again and again
    if (selectedChat?.id === chat.id) return;
    setSelectedChat(chat);
    setIsChatViewVisible(true);
  };

  const handleBackToList = () => {
    setIsChatViewVisible(false);
    setSelectedChat(null);
  };

  // Auto-deselect the chat if it is no longer present in the list
  useEffect(() => {
    if (!selectedChat) return;
    const stillExists = chats.some((c) => c.id === selectedChat.id);
    if (!stillExists) {
      setSelectedChat(null);
      setIsChatViewVisible(false);
    }
  }, [chats, selectedChat]);

  // Select chat from ?contact= query param (only when we have chats)
  useEffect(() => {
    if (!contactId || chats.length === 0) return;

    const chatToSelect = chats.find(
      (chat) => chat.contactId === contactId || chat.contact?.id === contactId
    );

    if (chatToSelect) {
      // Only update if different from current
      if (selectedChat?.id !== chatToSelect.id) {
        handleSelectChat(chatToSelect);
      }
    }
  }, [contactId, chats, selectedChat]);

  // Initial loading (before we know user / canFetch)
  if (!canFetch) {
    return <div>Loading...</div>;
  }

  // Only show loading for the *first* fetch
  if (loading) {
    return <div>Loading chats...</div>;
  }

  if (error) {
    return <div>Error: {(error as Error).message}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* LEFT — Chat List */}
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

      {/* RIGHT — Chat View */}
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
