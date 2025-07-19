import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const authenticate = (handler: Function) => {
  return async (req: NextRequest, ...args: any[]) => {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      (req as any).user = decoded;
      return handler(req, ...args);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
  };
};
