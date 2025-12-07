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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chat: Chat) => void;
  userRole?: string;
  onFilterChange: (userId: string | undefined) => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  showUnreadOnly: boolean;
  onToggleUnread: () => void;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

export function ChatList({
  chats,
  onSelectChat,
  userRole,
  onFilterChange,
  searchTerm,
  onSearchChange,
  showUnreadOnly,
  onToggleUnread,
  page,
  setPage,
  totalPages,
}: ChatListProps) {
  const { users } = useUsers();
  const { assignContact } = useContacts();

  // 🔥 Optimize user lookup
  const userMap = useMemo(() => {
    return Object.fromEntries(users.map((u: User) => [u.id, u]));
  }, [users]);

  return (
    <div className="border-r flex flex-col h-full">
      <div className="p-2">
        <h2 className="text-xl font-bold">Chats</h2>

        {/* Search */}
        <div className="flex items-center gap-2 p-2">
          <input
            type="text"
            value={searchTerm ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contacts and names..."
            className="border bg-gray-100 rounded text-sm px-3 py-2 w-full"
          />

          <button
            className={`px-3 py-2 text-sm rounded border ${
              showUnreadOnly ? "bg-blue-950 text-white" : " bg-gray-100"
            }`}
            onClick={onToggleUnread}
          >
            Unread
          </button>
        </div>

        {/* Filter (admin only) */}
        {userRole === "admin" && (
          <div className="mt-4">
            <Select
              onValueChange={(value) =>
                onFilterChange(value === "all" ? undefined : value)
              }
            >
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

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No chats found.</p>
          </div>
        ) : (
          <ul>
            {chats.map((chat) =>
              chat.contact ? (
                <li
                  key={chat.id}
                  className="p-4 border-b cursor-pointer hover:bg-gray-100"
                >
                  <div
                    className="flex items-center"
                    onClick={() => onSelectChat(chat)}
                  >
                    <Avatar>
                      <AvatarImage src={chat.contact.avatar} />
                      <AvatarFallback>
                        {chat.contact.name?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="ml-4 w-full">
                      <div className="flex justify-between">
                        <p className="font-bold">{chat.contact.name}</p>

                        {chat.lastMessage?.messageTimestamp && (
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(chat.lastMessage.messageTimestamp),
                              { addSuffix: true }
                            )}
                          </p>
                        )}
                      </div>

                      <p className="text-sm text-gray-500">
                        {chat.contact.phone}
                      </p>

                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {chat.lastMessage?.content}
                      </p>
                    </div>
                  </div>

                  {/* Assignment */}
                  <div className="mt-2 flex items-center">
                    <p className="text-sm text-gray-500 mr-2">
                      Assigned to:{" "}
                      {chat.contact.assignedToUserId
                        ? userMap[chat.contact.assignedToUserId]?.name
                        : "Unassigned"}
                    </p>

                    {userRole === "admin" && (
                      <Select
                        value={chat.contact.assignedToUserId || ""}
                        onValueChange={(value) =>
                          assignContact(chat.contact.id, value)
                        }
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
              ) : null
            )}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between">
          <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
