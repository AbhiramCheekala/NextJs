import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication token not provided' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('user', JSON.stringify(payload));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Invalid token' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: ['/api/chats/:path*', '/api/contacts/:path*'],
};