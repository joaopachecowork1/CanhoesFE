"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { CanhoesChrome } from "@/components/chrome/canhoes/CanhoesChrome";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

function AuthLoadingState({ label }: Readonly<{ label: string }>) {
  return (
    <div
      data-theme="canhoes"
      className="bg-circuit min-h-[100svh] bg-[var(--bg-void)] text-[var(--text-primary)]"
    >
      <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-[var(--radius-xl-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(15,22,10,0.96)] p-5 shadow-[var(--shadow-panel)] sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="h-8 w-64 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(22,28,15,0.92)] p-4">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-8 w-16 rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 border-t border-[rgba(212,184,150,0.12)] pt-4">
            <Skeleton className="h-10 w-40 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        <p className="text-center font-[var(--font-mono)] text-sm uppercase tracking-[0.14em] text-[var(--beige)]/76">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function CanhoesAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isLogged, loading, user } = useAuth();

  useEffect(() => {
    if (!loading && !isLogged) {
      router.replace("/canhoes/login");
    }
  }, [isLogged, loading, router]);

  if (loading && !user) {
    return <AuthLoadingState label="A preparar os Canhoes..." />;
  }

  if (!loading && !isLogged) {
    return <AuthLoadingState label="A redirecionar..." />;
  }

  return <CanhoesChrome>{children}</CanhoesChrome>;
}
