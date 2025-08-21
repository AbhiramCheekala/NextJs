import {
  mysqlTable,
  serial,
  varchar,
  json,
  timestamp,
} from "drizzle-orm/mysql-core";

export const templates = mysqlTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  components: json("components").notNull(),
  status: varchar("status", { length: 50 }).default("LOCAL"),
  lastUpdated: timestamp("last_updated", { mode: "date" })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
