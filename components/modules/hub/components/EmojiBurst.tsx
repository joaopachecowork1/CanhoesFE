"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type EmojiParticle = {
  id: string;
  x: number;
  y: number;
  scale: number;
  tx: number;
  ty: number;
};

type EmojiBurst = {
  id: number;
  x: number;
  y: number;
  emoji: string;
  particles: EmojiParticle[];
};

type EmojiBurstContainerProps = {
  bursts: EmojiBurst[];
  onClear: () => void;
};

/**
 * EmojiBurst — small emoji explosions at the point of a click.
 * Spawns 6-8 mini emojis that fly outward with random trajectories and fade out.
 */
export function EmojiBurstContainer({ bursts, onClear }: Readonly<EmojiBurstContainerProps>) {
  useEffect(() => {
    if (bursts.length === 0) return;
    const timer = setTimeout(onClear, 800);
    return () => clearTimeout(timer);
  }, [bursts, onClear]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]">
      <AnimatePresence>
        {bursts.map((burst) =>
          burst.particles.map((particle) => (
            <motion.span
              key={particle.id}
              initial={{
                x: burst.x,
                y: burst.y,
                scale: 0.3,
                opacity: 1,
              }}
              animate={{
                x: burst.x + particle.tx,
                y: burst.y + particle.ty,
                scale: particle.scale,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute text-lg"
              aria-hidden="true"
            >
              {burst.emoji}
            </motion.span>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook to manage emoji bursts.
 * Returns the current bursts array and a trigger function.
 */
function createParticles(burstId: number, x: number, y: number): EmojiParticle[] {
  return Array.from({ length: 7 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 7;
    const distance = 30 + index * 4;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 20;

    return {
      id: `${burstId}-${index}`,
      x,
      y,
      scale: 1 + index * 0.05,
      tx,
      ty,
    };
  });
}

export function useEmojiBurst() {
  const [bursts, setBursts] = useState<EmojiBurst[]>([]);
  const nextIdRef = useRef(0);

  const trigger = (emoji: string, x: number, y: number) => {
    const id = Date.now() + (nextIdRef.current++);
    setBursts((prev) => [...prev, { id, emoji, x, y, particles: createParticles(id, x, y) }]);
  };

  const clear = () => setBursts([]);

  return { bursts, trigger, clear };
}
