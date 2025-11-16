
export interface WhatsAppWebhookBody {
  object: "whatsapp_business_account";
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  field: "messages";
  value: WhatsAppValue;
}

export interface WhatsAppValue {
  messaging_product: "whatsapp";
  metadata: WhatsAppMetadata;
  contacts: WhatsAppContact[];
  messages: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
    type: string;
  };
}

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "image" | "audio" | "video" | "document" | "sticker" | "location" | "contacts" | "interactive" | "button";
  text?: {
    body: string;
  };
  // Add other message types as needed
}

