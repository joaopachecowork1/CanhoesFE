import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--bg-paper)] placeholder:text-[rgba(245,237,224,0.64)] selection:bg-[var(--moss)] selection:text-white flex min-h-11 w-full min-w-0 rounded-[var(--radius-sm-token)] border border-[rgba(212,184,150,0.16)] bg-[var(--bg-surface)] px-4 py-3 font-[var(--font-body)] text-base text-[var(--bg-paper)] shadow-[var(--shadow-card)] transition-[border-color,box-shadow,background-color,transform] duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-[rgba(212,184,150,0.24)] hover:shadow-[var(--shadow-layered)] focus-visible:border-[var(--border-neon)] focus-visible:bg-[var(--bg-deep)] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-purple)]/24 focus-visible:shadow-[var(--shadow-panel),0_0_20px_rgba(177,140,255,0.12)] aria-invalid:border-[var(--destructive)] aria-invalid:ring-[var(--destructive)]/20",
        className
      )}

      {...props}
    />
  );
}

export { Input };
