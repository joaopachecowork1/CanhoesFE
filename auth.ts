import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile",
          // Use standard auth code flow. Google rejects hybrid flow without nonce.
          response_type: "code",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
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

      token.isAdmin = Boolean(token.isAdmin);

      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = Boolean(token.isAdmin);
      session.idToken = token.idToken;

      if (!session.idToken) {
        console.warn("[Auth Session Callback] ⚠️ NO ID TOKEN IN SESSION - Login will likely fail");
      }

      return session;
    },
  },
};
