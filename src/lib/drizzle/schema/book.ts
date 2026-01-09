import {
  mysqlTable,
  varchar,
  serial,
  int,
  json,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { relations, InferSelectModel, InferInsertModel } from "drizzle-orm";

export const booksTable = mysqlTable('books', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  author: varchar('author', { length: 256 }).notNull(),
  isbn: varchar('isbn', { length: 256 }).notNull(),
});

export type bookSelect = InferSelectModel<typeof booksTable>;
export type bookInsert = InferInsertModel<typeof booksTable>;