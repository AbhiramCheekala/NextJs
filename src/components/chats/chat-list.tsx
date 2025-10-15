"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Chat } from "@/types/chat";
import { useUsers, useContacts } from "@/hooks/useContacts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/lib/drizzle/schema/users";

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
  userRole?: string;
  onFilterChange: (userId: string | undefined) => void;
}

export function ChatList({
  chats,
  onSelectChat,
  userRole,
  onFilterChange,
}: ChatListProps) {
  const { users } = useUsers();
  const { assignContact } = useContacts();

  const handleAssignContact = (contactId: string, userId: string) => {
    assignContact(contactId, userId);
  };

  const getAssigneeName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unassigned";
  };

  return (
    <div className="border-r">
      <div className="p-4">
        <h2 className="text-xl font-bold">Chats</h2>
        {userRole === "admin" && (
          <div className="mt-4">
            <Select onValueChange={(value) => onFilterChange(value === "all" ? undefined : value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by assignee..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {users.map((user: User) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      {chats.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No chats assigned to you yet.</p>
        </div>
      ) : (
        <ul>
          {chats.map((chat) => (
            <li
              key={chat.id}
              className="p-4 border-b cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center" onClick={() => onSelectChat(chat)}>
                <Avatar>
                  <AvatarImage src={chat.contact.avatar} />
                  <AvatarFallback>{chat.contact.name[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-bold">{chat.contact.name}</p>
                  <p className="text-sm text-gray-500">
                    {chat.lastMessage?.content}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <p className="text-sm text-gray-500 mr-2">
                  Assigned to:{" "}
                  {chat.contact.assignedToUserId
                    ? getAssigneeName(chat.contact.assignedToUserId)
                    : "Unassigned"}
                </p>
                {userRole === "admin" && (
                  <Select
                    onValueChange={(value) =>
                      handleAssignContact(chat.contact.id, value)
                    }
                    defaultValue={chat.contact.assignedToUserId || undefined}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: User) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}