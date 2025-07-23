import { NextRequest, NextResponse } from "next/server";
import * as ContactService from "@/app/api/contacts/service";
import { createId } from "@paralleldrive/cuid2";

export async function createContact(req: NextRequest) {
  const body = await req.json();
  const object = {
    ...body,
    id: createId(),
  };
  const existingContact = await ContactService.checkContactExistence(
    body.phone
  );
  if (existingContact) {
    return NextResponse.json(
      { error: "Contact already exists" },
      { status: 400 }
    );
  }
  const created = await ContactService.createContact(object);
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

export async function getAllContacts(req: NextRequest) {
  const contacts = await ContactService.getAllContacts();
  return NextResponse.json({ data: contacts });
}
