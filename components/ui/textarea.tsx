import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "input-psycho-focus placeholder:text-[rgba(245,237,224,0.66)] flex field-sizing-content min-h-24 w-full rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.16)] bg-[rgba(12,16,8,0.78)] px-4 py-3 font-[var(--font-body)] text-base text-[var(--bg-paper)] shadow-[var(--shadow-panel)] transition-[color,box-shadow,border-color,background-color] outline-none hover:border-[rgba(212,184,150,0.24)] focus-visible:border-[var(--border-neon)] focus-visible:bg-[rgba(18,23,12,0.9)] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-purple)]/24 disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
