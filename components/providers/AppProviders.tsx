"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SignalRProvider } from "@/contexts/SignalRContext";
import { DevAuthModeBanner } from "@/components/dev/DevAuthModeBanner";
import { ThemeProvider } from "@/components/ui/themeprovider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const client = new QueryClient({
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

export default function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider basePath="/api/auth">
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <QueryClientProvider client={client}>
          <AuthProvider>
            <SignalRProvider>
              {children}
              <Toaster />
              <DevAuthModeBanner />
            </SignalRProvider>
          </AuthProvider>
          {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
