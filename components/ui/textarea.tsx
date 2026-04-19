import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.16)] bg-[var(--bg-surface)] px-4 py-3 font-[var(--font-body)] text-base text-[var(--bg-paper)] shadow-[var(--shadow-card)] transition-[border-color,box-shadow,background-color,transform] duration-200 outline-none hover:border-[rgba(212,184,150,0.24)] hover:shadow-[var(--shadow-layered)] focus-visible:border-[var(--border-neon)] focus-visible:bg-[var(--bg-deep)] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-purple)]/24 focus-visible:shadow-[var(--shadow-panel),0_0_20px_rgba(177,140,255,0.12)] disabled:cursor-not-allowed disabled:opacity-50 resize-none placeholder:opacity-70",
        className
      )}

      {...props}
    />
  );
}

export { Textarea };
