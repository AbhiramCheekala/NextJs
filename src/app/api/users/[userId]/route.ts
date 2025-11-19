import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "../controller"; // Import the getUserById function, updateUser, and deleteUser
import { authenticate } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  return authenticate(async () => {
    try {
      const { userId } = await params;
      const user = await getUserById(userId);

      if (!user) {
        return NextResponse.json(
          { message: "User not found." },
          { status: 404 }
        );
      }

      // Remove password from the returned user object for security
      const { password, ...userWithoutPassword } = user;

      return NextResponse.json({ data: userWithoutPassword }, { status: 200 });
    } catch (error: unknown) {
      console.error("Error fetching user:", error);
      return NextResponse.json(
        {
          message: "Internal server error.",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  })(req);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Pass the request and params to the updateUser controller function
  return authenticate(updateUser)(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Pass the request and params to the deleteUser controller function
  return authenticate(deleteUser)(req, { params });
}
