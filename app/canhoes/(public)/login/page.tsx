"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";

import { CanhoesBrandMark } from "@/components/chrome/canhoes/CanhoesBrandMark";
import { CanhoesHeroEmblem } from "@/components/chrome/canhoes/CanhoesHeroEmblem";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function CanhoesLoginPage() {
  const router = useRouter();
  const { isLogged, loading, loginGoogle, isDevAuthBypass } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [leafParticles, setLeafParticles] = useState<
    Array<{ delay: number; id: number; x: number }>
  >([]);

  useEffect(() => {
    setLeafParticles(
      Array.from({ length: 16 }, (_, index) => ({
        delay: Math.random() * 4.5,
        id: index,
        x: Math.random() * 100,
      }))
    );
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsVisible(true), 100);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isDevAuthBypass && !loading && isLogged) {
      router.replace("/canhoes");
    }
  }, [isDevAuthBypass, isLogged, loading, router]);

  const handleLogin = () => {
    setIsSigningIn(true);
    console.log("[Login Page] Starting Google sign-in...");
    loginGoogle();
  };

  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(0,255,136,0.16),transparent_30rem),linear-gradient(180deg,var(--bg-deep)_0%,var(--bg-void)_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {leafParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute -top-8 text-[rgba(212,184,150,0.18)]"
            style={{
              animation: `leaf-fall ${8 + Math.random() * 4}s linear ${particle.delay}s infinite`,
              left: `${particle.x}%`,
            }}
          >
            <Leaf className="h-5 w-5" />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 py-10">
        <section
          className="w-full max-w-md rounded-[var(--radius-xl-token)] border border-[var(--border-subtle)] bg-[rgba(22,28,14,0.9)] p-6 text-[var(--text-primary)] shadow-[var(--shadow-modal)] backdrop-blur-xl sm:p-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 420ms ease, transform 420ms ease",
          }}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <CanhoesHeroEmblem />
            </div>

            <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <CanhoesBrandMark compact />
              </div>
              <p className="editorial-kicker text-[var(--beige)]">
                Ritual anual
              </p>
              <p className="body-small text-[var(--beige)]/78">
                Um espaco privado para o feed, os premios, as votacoes e o
                arquivo do grupo.
              </p>
            </div>

            <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(0,255,136,0.18),transparent)]" />

            <div className="space-y-3">
              {isDevAuthBypass ? (
                <div className="rounded-lg border border-[rgba(255,209,102,0.32)] bg-[rgba(62,38,12,0.72)] px-3 py-2 text-xs text-[rgba(255,236,188,0.92)]">
                  Modo desenvolvimento ativo. Bypass auth local ligado.
                </div>
              ) : null}

              {isDevAuthBypass ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/canhoes")}
                >
                  Entrar em modo desenvolvimento
                </Button>
              ) : null}

              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={isSigningIn || (loading && isLogged)}
              >
                {isSigningIn || (loading && isLogged)
                  ? "A entrar..."
                  : "Continuar com Google"}
              </Button>
              <p className="text-center text-xs text-[var(--beige)]/72">
                Acesso reservado aos membros do evento. O login Google continua ativo.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
