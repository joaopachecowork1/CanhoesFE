"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type EmojiBurst = {
  id: number;
  x: number;
  y: number;
  emoji: string;
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
          Array.from({ length: 7 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 7 + (Math.random() - 0.5) * 0.5;
            const distance = 30 + Math.random() * 40;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 20;

            return (
              <motion.span
                key={`${burst.id}-${i}`}
                initial={{
                  x: burst.x,
                  y: burst.y,
                  scale: 0.3,
                  opacity: 1,
                }}
                animate={{
                  x: burst.x + tx,
                  y: burst.y + ty,
                  scale: 1 + Math.random() * 0.4,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.5 + Math.random() * 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="absolute text-lg"
                aria-hidden="true"
              >
                {burst.emoji}
              </motion.span>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook to manage emoji bursts.
 * Returns the current bursts array and a trigger function.
 */
export function useEmojiBurst() {
  const [bursts, setBursts] = useState<EmojiBurst[]>([]);
  const nextIdRef = useRef(0);

  const trigger = (emoji: string, x: number, y: number) => {
    const id = Date.now() + (nextIdRef.current++);
    setBursts((prev) => [...prev, { id, emoji, x, y }]);
  };

  const clear = () => setBursts([]);

  return { bursts, trigger, clear };
}
