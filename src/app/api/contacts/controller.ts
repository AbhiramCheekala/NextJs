import { NextRequest, NextResponse } from "next/server";
import * as ContactService from "@/app/api/contacts/service";
import { createId } from "@paralleldrive/cuid2";
import logger from "@/lib/logger";

export async function createContact(req: NextRequest) {
  const body = await req.json();
  logger.info("Creating new contact with data: %o", body);

  const object = {
    ...body,
    id: createId(),
  };

  const existingContact = await ContactService.checkContactExistence(
    body.phone
  );
  if (existingContact) {
    logger.warn("Contact already exists with phone: %s", body.phone);
    return NextResponse.json(
      { error: "Contact already exists" },
      { status: 400 }
    );
  }

  const created = await ContactService.createContact(object);
  logger.info("Contact created successfully with ID: %s", created.id);
  return NextResponse.json({ status: "success", data: created });
}

export async function getContact(req: NextRequest, id: string) {
  logger.info("Fetching contact with ID: %s", id);
  const contact = await ContactService.getContactById(id);

  if (!contact) {
    logger.warn("Contact not found for ID: %s", id);
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json({ data: contact });
}

export async function updateContact(req: NextRequest, id: string) {
  const updates = await req.json();
  logger.info("Updating contact with ID: %s", id);

  const updated = await ContactService.updateContactById(id, updates);

  return NextResponse.json({ status: "success", data: updated });
}

export async function deleteContact(req: NextRequest, id: string) {
  const contact = await ContactService.getContactById(id);
  if (!contact) {
    return NextResponse.json({ error: "No Contact found" }, { status: 404 });
  } else {
    await ContactService.deleteContactById(id);
    return NextResponse.json({
      status: "success",
      message: "Contact deleted successfully",
    });
  }
}

export async function getAllContacts(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";

  logger.info(
    `Fetching contacts with page: ${page}, limit: ${limit}, search: ${search}`
  );

  const { contacts, total } = await ContactService.getAllContacts({
    page,
    limit,
    search,
  });

  return NextResponse.json({
    data: contacts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function createBulkContacts(req: NextRequest) {
  const { contacts, tags } = await req.json();
  logger.info("Creating bulk contacts with data: %o", contacts);

  const created = await ContactService.createBulkContacts(contacts, tags);
  logger.info("Bulk contacts created successfully");
  return NextResponse.json({ status: "success", data: created });
}
