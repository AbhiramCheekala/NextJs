export type ContactTag = string; // Allow any string for dynamic tags

export interface Contact {
  label: any;
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: ContactTag[];
  lastContacted: string; // Could be Date object if preferred, using string for simplicity in mock
  avatar?: string; // Optional avatar URL
  dataAiHint?: string; // Optional hint for AI image generation
}

export interface AssignContactRequest {
  userId: string;
}
