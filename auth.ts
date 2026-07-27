import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { resolveUser, type ResolvedUser } from "@/lib/services/authService";

const developmentLoginEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.DEV_AUTH_BYPASS_ENABLED?.trim().toLowerCase() === "true";

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
    ...(developmentLoginEnabled
      ? [
          CredentialsProvider({
            id: "development",
            name: "Development login",
            credentials: {},
            async authorize() {
              const email = (process.env.DEV_AUTH_EMAIL ?? "dev@example.com").trim().toLowerCase();
              const externalId = (process.env.DEV_AUTH_USER_ID ?? `dev:${email}`).trim();
              const displayName = (process.env.DEV_AUTH_NAME ?? "Dev User").trim();
              const user = await resolveUser(externalId, email, displayName);
              return {
                id: user.id,
                email: user.email,
                name: user.displayName ?? user.email,
              };
            },
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/canhoes/login",
    error: "/canhoes/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.providerAccountId) {
        token.externalId = account.providerAccountId;
      }

      if (account?.id_token) {
        token.idToken = account.id_token;
      }

      if (account?.access_token && !token.idToken) {
        token.idToken = account.access_token;
      }

      if (user?.id) {
        token.dbUserId = user.id;
      }

      token.authMode = account?.provider === "development" ? "development" : token.authMode ?? "google";

      let dbUser: ResolvedUser | null = token.dbUserId
        ? await prisma.user.findUnique({
            where: { id: String(token.dbUserId) },
            select: { id: true, email: true, displayName: true, isAdmin: true },
          })
        : null;

      if (!dbUser && token.email) {
        const externalId = String(token.externalId ?? token.sub ?? token.email);
        dbUser = await resolveUser(externalId, token.email, token.name ?? null);
        token.dbUserId = dbUser.id;
      }

      token.isAdmin = Boolean(dbUser?.isAdmin);
      if (dbUser) token.sub = dbUser.id;

      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = Boolean(token.isAdmin);
      session.user.id = String(token.dbUserId ?? token.sub ?? "");
      session.idToken = token.idToken;
      session.authMode = token.authMode === "development" ? "development" : "google";

      return session;
    },
  },
};
