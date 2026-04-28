import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const devAuthBypassEnabled =
  (process.env.DEV_AUTH_BYPASS_ENABLED ??
    process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS_ENABLED ??
    "false")
    .trim()
    .toLowerCase() === "true";

export function shouldRedirectUnauthenticated(token: unknown) {
  if (devAuthBypassEnabled) {
    return false;
  }

  return !token;
}

export default withAuth(
  function middleware(_req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !shouldRedirectUnauthenticated(token),
    },
  }
);

export const config = {
  matcher: ["/canhoes/admin/:path*"],
};
