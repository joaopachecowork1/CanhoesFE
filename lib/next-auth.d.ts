import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    authMode?: "google" | "development";
    user: {
      id: string;
      isAdmin?: boolean;
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dbUserId?: string;
    externalId?: string;
    authMode?: "google" | "development";
    isAdmin?: boolean;
  }
}
