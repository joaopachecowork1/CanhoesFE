"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
        staleTime: 60_000, // 1 minute - reduces backend load
        gcTime: 5 * 60 * 1000, // 5 minutes - keeps data in memory longer
        networkMode: "online",
      },
      mutations: {
        retry: 0, // Don't retry mutations to avoid duplicate writes
      },
    },
  });
}

export default function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  // One client per component instance: a module-level client would be shared by every SSR request.
  const [client] = React.useState(createQueryClient);

  return (
    <SessionProvider basePath="/api/auth">
      <QueryClientProvider client={client}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        {process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_QUERY_DEVTOOLS === "true" ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </SessionProvider>
  );
}
