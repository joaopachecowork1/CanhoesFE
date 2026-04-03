import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--bg-paper)] placeholder:text-[rgba(245,237,224,0.66)] selection:bg-[var(--moss)] selection:text-[var(--text-primary)] min-h-11 w-full min-w-0 rounded-[var(--radius-sm-token)] border border-[rgba(212,184,150,0.16)] bg-[rgba(12,16,8,0.78)] px-4 py-3 font-[var(--font-body)] text-base text-[var(--bg-paper)] shadow-[var(--shadow-panel)] transition-[color,box-shadow,border-color,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-[rgba(212,184,150,0.24)]",
        "input-psycho-focus focus-visible:border-[var(--border-neon)] focus-visible:bg-[rgba(18,23,12,0.9)] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-purple)]/24",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
