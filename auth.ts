import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { isDevelopmentAuthEnabled } from "@/lib/auth/developmentAuth";
import { isDatabaseUserId } from "@/lib/auth/userIdentity";
import { resolveDevelopmentAdmin, resolveUser, type ResolvedUser } from "@/lib/services/authService";

const developmentLoginEnabled = isDevelopmentAuthEnabled();

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
              const user = await resolveDevelopmentAdmin(externalId, email, displayName);
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

      if (user?.id && account?.provider === "development") {
        token.dbUserId = user.id;
      }

      if (account?.provider === "google") {
        token.dbUserId = undefined;
      }

      if (account?.provider === "development") token.authMode = "development";
      if (account?.provider === "google") token.authMode = "google";

      let dbUser: ResolvedUser | null = isDatabaseUserId(token.dbUserId)
        ? await prisma.user.findUnique({
            where: { id: token.dbUserId },
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
      session.authMode = token.authMode === "development" ? "development" : "google";

      return session;
    },
  },
};
