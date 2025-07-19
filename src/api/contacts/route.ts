import { createContact } from "@/api/contacts/controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await createContact(req);
}
