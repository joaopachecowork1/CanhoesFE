import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(ellipse_at_top,rgba(26,32,15,0.92),rgba(12,16,8,0.78))] px-4 py-3 font-[var(--font-body)] text-base text-[var(--bg-paper)] shadow-[var(--shadow-panel)] transition-all duration-200 outline-none hover:border-[rgba(212,184,150,0.24)] hover:shadow-[var(--shadow-layered)] focus-visible:border-[var(--border-neon)] focus-visible:bg-[radial-gradient(ellipse_at_top,rgba(28,36,16,0.96),rgba(18,23,12,0.9))] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-purple)]/24 focus-visible:shadow-[var(--shadow-panel),0_0_20px_rgba(177,140,255,0.12)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none focus-visible:outline-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:-translate-x-full before:translate-y-2 before:translate-x-[calc(-50%_-_4px)] before:translate-y-2 before:rounded-[var(--radius-sm-token)] before:bg-[var(--accent-purple)] before:opacity-0 before:transition-all before:duration-300 before:content-[''] before:after:absolute before:after:inset-y-0 before:after:left-1 before:after:w-1 before:after:-translate-x-full before:after:translate-y-2 before:after:translate-x-[calc(-50%-1.5px)] before:after:rounded-[var(--radius-sm-token)] before:after:bg-[var(--accent-purple)] before:after:content-[''] before:focus-within:after:translate-x-0 before:focus-within:opacity-100 before:focus-within:translate-y-0 placeholder:opacity-70",
        className
      )}
      style={{ willChange: "opacity" }}
      aria-describedby={undefined}
      {...props}
    />
  );
}

export { Textarea };
