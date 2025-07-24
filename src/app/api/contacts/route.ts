import * as contactController from "@/app/api/contacts/controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return await contactController.createContact(req);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    return await contactController.getContact(req, id);
  } else {
    return await contactController.getAllContacts(req);
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Contact ID is required" },
      { status: 400 }
    );
  }
  return await contactController.updateContact(req, id);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "No Contact ID is given" },
      { status: 400 }
    );
  }
  return await contactController.deleteContact(req, id);
}
