import * as bookModel from "@/app/api/books/model";
import { bookInsert } from "@/lib/drizzle/schema/book";

export class BookService {
  public async createBook(input: bookInsert) {
    return await bookModel.createBook(input);
  }

  public async getBookById(id: number) {
    return await bookModel.getBookById(id);
  }

  public async deleteBookById(id: number) {
    return await bookModel.deleteBookById(id);
  }

  public async updateBookById(id: number, input: Partial<bookInsert>) {
    return await bookModel.updateBookById(id, input);
  }

  public async getAllBooks() {
    return await bookModel.getAllBooks();
  }
}
