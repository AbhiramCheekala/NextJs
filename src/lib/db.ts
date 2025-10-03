import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as campaigns from "./drizzle/schema/campaigns";
import * as chatMessages from "./drizzle/schema/chatMessages";
import * as chats from "./drizzle/schema/chats";
import * as contacts from "./drizzle/schema/contacts";
import * as label from "./drizzle/schema/label";
import * as messages from "./drizzle/schema/messages";
import * as templates from "./drizzle/schema/templates";
import * as users from "./drizzle/schema/users";

const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  database: process.env.DB_NAME!,
});

export const db = drizzle(pool, {
  schema: {
    ...campaigns,
    ...chatMessages,
    ...chats,
    ...contacts,
    ...label,
    ...messages,
    ...templates,
    ...users,
  },
  mode: "default",
});