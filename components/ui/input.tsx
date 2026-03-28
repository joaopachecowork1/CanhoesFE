import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--text-dark)] placeholder:text-[var(--text-muted)] selection:bg-[var(--neon-green)] selection:text-[var(--bg-void)] min-h-11 w-full min-w-0 rounded-[var(--radius-md-token)] border-2 border-transparent bg-[var(--bg-paper-alt)] px-4 py-3 text-base text-[var(--text-dark)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-[color,box-shadow,border-color,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "input-psycho-focus focus-visible:border-[var(--neon-green)] focus-visible:bg-[var(--bg-paper)] focus-visible:[box-shadow:0_0_0_3px_rgba(0,255,136,0.18)]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
