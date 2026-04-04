/**
 * Loading indicator for async operations.
 * Matches the dark paper theme with moose-inspired border colors.
 * Uses the app's primary accent color for smooth breathing animation.
 *
 * @example
 * ```tsx
 * <LoadingDots className="mr-2" />
 * <LoadingDots className="h-5 w-5" />
 * ```
 */
export function LoadingDots({
  className,
}: Readonly<{
  className?: string;
}>) {
  return (
    <span
      aria-label="Carregando"
      className={`inline-flex items-center gap-1.5 ${className || ""}`}
      role="status"
    >
      <span
        className="h-1.5 w-1.5 animate-[ping_1s_ease-in-out_infinite] rounded-full bg-[var(--color-accent)]"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="h-1.5 w-1.5 animate-[ping_1s_ease-in-out_infinite] rounded-full bg-[var(--color-accent)]"
        style={{ animationDelay: "100ms" }}
      />
      <span
        className="h-1.5 w-1.5 animate-[ping_1s_ease-in-out_infinite] rounded-full bg-[var(--color-accent)]"
        style={{ animationDelay: "200ms" }}
      />
    </span>
  );
}
