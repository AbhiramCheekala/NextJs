import { NextRequest, NextResponse } from "next/server";
import * as ContactService from "@/api/contacts/service";

export async function createContact(req: NextRequest) {
  const body = await req.json();
  const created = await ContactService.createContact(body);
  return NextResponse.json({ status: "success", data: created });
}

export async function getContact(req: NextRequest, id: string) {
  const Contact = await ContactService.getContactById(id);
  if (!Contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }
  return NextResponse.json({ data: Contact });
}

export async function updateContact(req: NextRequest, id: string) {
  const updates = await req.json();
  const updated = await ContactService.updateContactById(id, updates);
  return NextResponse.json({ status: "success", data: updated });
}
