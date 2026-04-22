import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("field-base file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--ink-primary)] file:placeholder:text-[var(--ink-muted)] file:selection:bg-[var(--moss)] file:selection:text-white min-h-11 rounded-[var(--radius-sm-token)] font-[var(--font-body)] aria-invalid:border-[var(--destructive)] aria-invalid:ring-[var(--destructive)]/20", className)}
      {...props}
    />
  );
}

export { Input };
