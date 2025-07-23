import {
  createContact,
  getAllContacts,
  getContact,
  updateContact,
} from "@/app/api/contacts/controller";
import { NextRequest, NextResponse } from "next/server";

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

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { status: "error", message: "Missing contact ID" },
      { status: 400 }
    );
  }

  try {
    return await updateContact(req, id);
  } catch (error) {
    console.error("[PUT /contacts]", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update contact" },
      { status: 500 }
    );
  }
}
