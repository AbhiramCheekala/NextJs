import { NextRequest, NextResponse } from "next/server";
import {
  createUserController,
  getAllUsers,
  getUserById,
  loginUser,
} from "@/app/api/users/controller";

// Handle GET requests (get all users or one by ID)
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  }

  const users = await getAllUsers();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await createUserController(body);
    return NextResponse.json({ status: 200 }, body);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
