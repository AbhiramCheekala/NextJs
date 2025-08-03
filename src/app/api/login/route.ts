import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/app/api/users/controller";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await loginUser(body);
    const status = response.status === "success" ? 200 : 401;
    return NextResponse.json(response, { status });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
