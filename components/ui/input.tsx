import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--text-ink)] placeholder:text-[var(--bark)]/52 selection:bg-[var(--moss)] selection:text-[var(--text-primary)] min-h-11 w-full min-w-0 rounded-[var(--radius-sm-token)] border border-[rgba(107,76,42,0.14)] bg-[linear-gradient(180deg,rgba(255,248,239,0.98),rgba(240,229,205,0.94))] px-4 py-3 font-[var(--font-body)] text-base text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)] transition-[color,box-shadow,border-color,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "input-psycho-focus focus-visible:border-[var(--border-neon)] focus-visible:bg-[var(--bg-paper-soft)] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-purple)]/24",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
