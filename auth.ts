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
          response_type: "code id_token",
          // Force Google to return id_token (not just access_token)
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      // Capture Google's id_token when first logging in
      if (account?.id_token) {
        token.idToken = account.id_token;
        console.log("[Auth JWT Callback] id_token captured from Google account");
      }

      // Capture access_token as fallback if id_token not available
      if (account?.access_token && !token.idToken) {
        token.idToken = account.access_token;
        console.log("[Auth JWT Callback] Using access_token as fallback (id_token missing)");
      }

      if (user) {
        token.isAdmin = Boolean((user as { isAdmin?: boolean }).isAdmin);
      }

      token.isAdmin = Boolean(token.isAdmin);

      // Log token state for debugging
      console.log("[Auth JWT Callback] Token state:", {
        hasIdToken: !!token.idToken,
        isAdmin: token.isAdmin,
        googleAccountPresent: account?.provider === "google",
      });

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
