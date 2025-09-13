import { NextResponse } from "next/server";
import { ContactService } from "../../service";
import { AssignContactRequest } from "@/types/contact";

type RouteContext = {
  params: Promise<{
    contactId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { contactId } = await context.params;
  const body: AssignContactRequest = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const contactService = new ContactService();
    await contactService.assignContact(contactId, userId);
    return NextResponse.json({
      success: true,
      message: "Contact assigned successfully",
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
