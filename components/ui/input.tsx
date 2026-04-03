import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--bg-paper)] placeholder:text-[rgba(245,237,224,0.66)] selection:bg-[var(--moss)] selection:text-[var(--text-primary)] min-h-11 w-full min-w-0 rounded-[var(--radius-sm-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(ellipse_at_top,rgba(26,32,15,0.92),rgba(12,16,8,0.78))] px-4 py-3 font-[var(--font-body)] text-base text-[var(--bg-paper)] shadow-[var(--shadow-panel)] transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-[rgba(212,184,150,0.24)] focus-visible:border-[var(--border-neon)] focus-visible:bg-[radial-gradient(ellipse_at_top,rgba(28,36,16,0.96),rgba(18,23,12,0.9))] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-purple)]/24 focus-visible:shadow-[var(--shadow-panel),0_0_20px_rgba(177,140,255,0.12)] focus-visible:outline-none focus-visible:border-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive before:absolute before:inset-y-0 before:left-0 before:w-1 before:-translate-x-full before:translate-y-2 before:translate-x-[calc(-50%_-_4px)] before:translate-y-2 before:rounded-[var(--radius-sm-token)] before:bg-[var(--accent-purple)] before:opacity-0 before:transition-all before:duration-300 before:content-[''] before:[content:''] before:after:absolute before:after:inset-y-0 before:after:left-1 before:after:w-1 before:after:-translate-x-full before:after:translate-y-2 before:after:translate-x-[calc(-50%-1.5px)] before:after:rounded-[var(--radius-sm-token)] before:after:bg-[var(--accent-purple)] before:after:content-[''] before:focus-within:after:translate-x-0 before:focus-within:opacity-100 before:focus-within:translate-y-0",
        className
      )}
      style={{ willChange: "opacity" }}
      aria-describedby={undefined}
      {...props}
    />
  );
}

export { Input };
