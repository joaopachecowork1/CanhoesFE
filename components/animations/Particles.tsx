"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  count?: number;
  colors?: string[];
  className?: string;
  durationMs?: number;
  onComplete?: () => void;
}

export function Particles({
  count = 20,
  colors,
  className,
  durationMs = 780,
  onComplete,
}: Readonly<ParticlesProps>) {
  const particleColors = React.useMemo(
    () =>
      colors ?? [
        "var(--color-psycho-1)",
        "var(--color-psycho-2)",
        "var(--color-psycho-3)",
        "var(--color-psycho-4)",
        "var(--color-brown)",
      ],
    [colors]
  );

  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, index) => ({
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      id: index,
      rotation: Math.random() * 360,
      size: Math.random() * 8 + 4,
      tx: (Math.random() - 0.5) * 220,
      ty: (Math.random() - 1) * 180,
      x: 50,
      y: 50,
    }));
  }, [count, particleColors]);

  useEffect(() => {
    if (!onComplete) return undefined;

    const timeoutId = globalThis.setTimeout(onComplete, durationMs + 40);
    return () => globalThis.clearTimeout(timeoutId);
  }, [durationMs, onComplete]);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle absolute rounded-full"
          style={
            {
              animationDuration: `${durationMs}ms`,
              backgroundColor: particle.color,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: `rotate(${particle.rotation}deg)`,
              width: `${particle.size}px`,
              "--tx": `${particle.tx}px`,
              "--ty": `${particle.ty}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
