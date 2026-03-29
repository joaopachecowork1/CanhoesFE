// src/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth is responsible for Google sign-in and for preserving the Google
 * OpenID `id_token` that the backend expects on authenticated API calls.
 *
 * The backend remains the source of truth for role information such as
 * `isAdmin`. The app-level AuthContext hydrates that from `/api/me`.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Ensure we receive an OpenID Connect id_token (needed by the backend)
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && account.id_token) {
        token.idToken = account.id_token;
      }

      // Preserve any explicit isAdmin value if an adapter/user object ever
      // provides it, but do not infer admin locally in the auth layer.
      if (user) {
        token.isAdmin = Boolean((user as { isAdmin?: boolean }).isAdmin);
      }

      token.isAdmin = Boolean(token.isAdmin);
      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = Boolean(token.isAdmin);
      session.idToken = token.idToken;
      return session;
    },
  },
};
