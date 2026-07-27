import { withAuth } from "next-auth/middleware";

export function shouldRedirectUnauthenticated(token: unknown) {
  return !token;
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
