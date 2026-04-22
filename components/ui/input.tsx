import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] selection:bg-[var(--moss)] selection:text-white flex min-h-11 w-full min-w-0 rounded-[var(--radius-sm-token)] border border-[var(--border-paper-soft)] bg-[var(--bg-paper-soft)] px-4 py-3 font-[var(--font-body)] text-base text-[var(--ink-primary)] shadow-none transition-[border-color,box-shadow,background-color] duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-[var(--border-paper)] focus-visible:border-[var(--border-moss)] focus-visible:bg-[var(--bg-paper)] focus-visible:ring-[3px] focus-visible:ring-[rgba(95,123,56,0.14)] aria-invalid:border-[var(--destructive)] aria-invalid:ring-[var(--destructive)]/20",
        className
      )}

      {...props}
    />
  );
}

export { Input };
