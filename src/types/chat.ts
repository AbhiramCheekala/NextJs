
import { contactSelect } from "@/lib/drizzle/schema/contacts";
import { User } from "@/lib/drizzle/schema/users";

export interface Chat {
  id: string;
  contactId: string;
  assignedTo: string | null;
  status: "open" | "closed" | "pending";
  createdAt: string;
  updatedAt: string;
  contact: contactSelect;
  user: User | null;
  lastMessage: Message | null;
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  direction: "incoming" | "outgoing";
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  messageTimestamp: string;
  createdAt: string;
  updatedAt: string;
}
