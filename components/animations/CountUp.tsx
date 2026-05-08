"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  /** Target number to count up to */
  to: number;
  /** Starting number (default: 0) */
  from?: number;
  /** Animation duration in ms (default: 1200) */
  duration?: number;
  /** Additional className for the wrapper span */
  className?: string;
  /** Format function (e.g. toLocaleString) */
  formatter?: (value: number) => string;
};

/**
 * Animated count-up component.
 * Counts from `from` to `to` when the element enters the viewport.
 * Inspired by React Bits CountUp — zero dependencies.
 */
export function CountUp({
  to,
  from = 0,
  duration = 1200,
  className,
  formatter = (v) => String(Math.round(v)),
}: Readonly<CountUpProps>) {
  const [display, setDisplay] = useState(formatter(from));
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const startTime = performance.now();
        const diff = to - from;

        function tick(now: number) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = from + diff * eased;

          setDisplay(formatter(current));

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            setDisplay(formatter(to));
          }
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [to, from, duration, formatter]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
