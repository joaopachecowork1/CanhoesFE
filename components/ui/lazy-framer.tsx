"use client";

import dynamic from "next/dynamic";

export const LazyMotion = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.LazyMotion })),
  { ssr: false }
);

export const MotionFeatures = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.LazyMotion })),
  { ssr: false }
);

export function useMotionFeatures() {
  return { cascade: true, drag: true };
}