import {
  createContact,
  getAllContacts,
  getContact,
} from "@/app/api/contacts/controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await createContact(req);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    return await getContact(req, id);
  } else {
    return await getAllContacts(req);
  }
}
