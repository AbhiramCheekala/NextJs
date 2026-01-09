import { eq } from "drizzle-orm";
import {
  bookInsert,
  bookSelect,
  booksTable,
} from "@/lib/drizzle/schema/book";
import logger from "@/lib/logger";
import { db } from "@/lib/db";

export const createBook = async (
  input: bookInsert
): Promise<bookSelect> => {
  const result: any = await db.insert(booksTable).values(input);

  const id = result[0].insertId;

  const [createdBook] = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, id));

  if (!createdBook) {
    throw new Error("Failed to fetch created book after insert");
  }

  logger.info(`Book created successfully: ${createdBook.id}`);
  return createdBook;
};

export const getBookById = async (
  id: number
): Promise<bookSelect | null> => {
  const [book] = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, id));

  if (!book) {
    logger.warn(`No book found for ID: ${id}`);
    return null;
  }
  return book;
};

export const updateBookById = async (
  id: number,
  updates: Partial<bookInsert>
): Promise<bookSelect> => {
  logger.info(`Updating book with ID: ${id}`);

  await db.update(booksTable).set(updates).where(eq(booksTable.id, id));

  const [updatedBook] = await db
    .select().
    from(booksTable)
    .where(eq(booksTable.id, id));

  if (!updatedBook) {
    logger.error(`Book with ID ${id} not found after update.`);
    throw new Error(`Book with ID ${id} not found`);
  }

  logger.info(`Book updated successfully: ${id}`);
  return updatedBook;
};

export const deleteBookById = async (id: number): Promise<void> => {
  const result: any = await db
    .delete(booksTable)
    .where(eq(booksTable.id, id));

  if (result.affectedRows === 0) {
    throw new Error(`No book found with ID: ${id}`);
  }

  logger.info(`Book deleted successfully: ${id}`);
};

export const getAllBooks = async (): Promise<{ books: bookSelect[] }> => {
  const books = await db.select().from(booksTable);
  logger.info(`Total books retrieved: ${books.length}`);
  return { books };
};
