import NextAuth from "next-auth";

import { authOptions } from "@/lib/domains/auth/services/auth";

// Behind a proxy or tunnel, set AUTH_TRUST_HOST=true so NextAuth builds URLs from the forwarded host.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
