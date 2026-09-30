import NextAuth from "next-auth";
import { authOptions } from "@/lib/domains/auth/services/auth";
import { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = async (req: NextRequest, context: any) => {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  
  if (host) {
    const url = new URL(req.url);
    url.host = host;
    url.protocol = protocol;
    
    process.env.NEXTAUTH_URL = `${protocol}://${host}`;
    
    // Pass a new request object to NextAuth so it sees the correct URL internally
    const newReq = new NextRequest(url, req);
    return NextAuth(authOptions)(newReq, context);
  }
  
  return NextAuth(authOptions)(req, context);
};

export { handler as GET, handler as POST };
