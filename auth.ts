import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { logger } from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile",
          response_type: "code",
        },
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/canhoes/login",
    error: "/canhoes/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
      }

      if (account?.access_token && !token.idToken) {
        token.idToken = account.access_token;
      }

      if (user) {
        token.isAdmin = Boolean((user as { isAdmin?: boolean }).isAdmin);
      }

      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
      if (token.email && adminEmails.includes(token.email.toLowerCase())) {
        token.isAdmin = true;
      }

      token.isAdmin = Boolean(token.isAdmin);

      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = Boolean(token.isAdmin);
      session.user.id = token.sub ?? "";
      session.idToken = token.idToken;

      if (!session.idToken) {
        logger.warn("[Auth Session Callback] NO ID TOKEN IN SESSION");
      }

      return session;
    },
  },
};
