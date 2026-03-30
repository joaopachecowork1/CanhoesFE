import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "input-psycho-focus placeholder:text-[var(--bark)]/52 flex field-sizing-content min-h-24 w-full rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.14)] bg-[linear-gradient(180deg,rgba(255,248,239,0.98),rgba(240,229,205,0.94))] px-4 py-3 font-[var(--font-body)] text-base text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)] transition-[color,box-shadow,border-color,background-color] outline-none focus-visible:border-[var(--border-neon)] focus-visible:bg-[var(--bg-paper-soft)] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-purple)]/24 disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
