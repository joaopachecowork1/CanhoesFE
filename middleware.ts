import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = (token as { isAdmin?: boolean })?.isAdmin;
    const path = req.nextUrl.pathname;
    
    if (path.startsWith("/canhoes/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/canhoes/feed", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/canhoes/admin/:path*"],
};