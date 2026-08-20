import { withAuth } from "next-auth/middleware";
import { isDevelopmentAuthEnabled } from "@/lib/domains/auth/services/developmentAuth";

export function shouldRedirectUnauthenticated(
  token: unknown,
  developmentAuthEnabled = isDevelopmentAuthEnabled()
) {
  return !token && !developmentAuthEnabled;
}

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname === "/canhoes/login") {
          return true;
        }
        return !shouldRedirectUnauthenticated(token);
      },
    },
  }
);

export const config = {
  matcher: ["/canhoes/:path*"],
};
