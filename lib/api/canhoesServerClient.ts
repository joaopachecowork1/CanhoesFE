import { cookies } from "next/headers";

/**
 * Server-side fetch client for Canhoes API.
 * Calls the backend directly (bypassing the Next.js proxy).
 */
export async function canhoesServerFetch<T>(path: string): Promise<T | null> {
  const baseUrl = process.env.CANHOES_API_URL || "http://localhost:5000";
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `${baseUrl}/api/v1/${normalizedPath}`;

  // Forward cookies for authentication
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      next: {
        revalidate: 60, // Cache for 1 minute on server
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) return null;
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${path} on server:`, error);
    return null;
  }
}
