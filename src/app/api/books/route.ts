import * as bookController from "@/app/api/books/controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await bookController.createBook(req);
}

export async function GET(req: NextRequest) {
  return await bookController.getAllBooks(req);
}
