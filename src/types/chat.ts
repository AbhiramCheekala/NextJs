
import { contactSelect } from "@/lib/drizzle/schema/contacts";
import { User } from "@/lib/drizzle/schema/users";

import { ChatStatus } from "../app/api/webhooks/whatsapp/types";

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
}

export interface Message {
  id: string;
  chatId: string;
  content: string;
  direction: "incoming" | "outgoing";
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  status: ChatStatus;
}
