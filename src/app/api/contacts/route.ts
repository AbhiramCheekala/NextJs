import * as contackController from "@/app/api/contacts/controller";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return await contackController.createContact(req);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    return await contackController.getContact(req, id);
  } else {
    return await contackController.getAllContacts(req);
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
  return await contackController.updateContact(req, id);
}
