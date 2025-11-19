import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Define a type for the decoded JWT payload
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  // Add other properties from your JWT payload
}

// Extend NextRequest to include the 'user' property
interface AuthenticatedNextRequest extends NextRequest {
  user?: AuthenticatedUser;
}

// Define the expected type for the handler function
type ApiHandler = (
  req: AuthenticatedNextRequest,
  ...args: any[] // params, etc.
) => Promise<NextResponse>;


export const authenticate = (handler: ApiHandler) => {
  return async (req: NextRequest, ...args: any[]) => { // The incoming req is still NextRequest
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedUser;
      const authenticatedReq = req as AuthenticatedNextRequest; // Cast req to AuthenticatedNextRequest
      authenticatedReq.user = decoded; // Assign decoded user to the new property
      return handler(authenticatedReq, ...args);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
  };
};
