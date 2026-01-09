import { NextRequest, NextResponse } from "next/server";
import { BookService } from "@/app/api/books/service";
import logger from "@/lib/logger";

const bookService = new BookService();

export async function createBook(req: NextRequest) {
  const body = await req.json();
  logger.info("Creating new book with data: %o", body);

  const created = await bookService.createBook(body);
  logger.info("Book created successfully with ID: %s", created.id);
  return NextResponse.json({ status: "success", data: created });
}

export async function getBook(req: NextRequest, id: number) {
  logger.info("Fetching book with ID: %s", id);
  const book = await bookService.getBookById(id);

  if (!book) {
    logger.warn("Book not found for ID: %s", id);
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  return NextResponse.json({ data: book });
}

export async function updateBook(req: NextRequest, id: number) {
  const updates = await req.json();
  logger.info("Updating book with ID: %s", id);

  const updated = await bookService.updateBookById(id, updates);

  return NextResponse.json({ status: "success", data: updated });
}

export async function deleteBook(req: NextRequest, id: number) {
  const book = await bookService.getBookById(id);
  if (!book) {
    return NextResponse.json({ error: "No Book found" }, { status: 404 });
  } else {
    await bookService.deleteBookById(id);
    return NextResponse.json({
      status: "success",
      message: "Book deleted successfully",
    });
  }
}

export async function getAllBooks(req: NextRequest) {
  logger.info(
    `Fetching books`
  );

  const { books } = await bookService.getAllBooks();

  return NextResponse.json({
    data: books
  });
}
