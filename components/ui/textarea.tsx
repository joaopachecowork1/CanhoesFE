import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-[var(--radius-md-token)] border border-[var(--border-paper-soft)] bg-[var(--bg-paper-soft)] px-4 py-3 font-[var(--font-body)] text-base text-[var(--ink-primary)] shadow-none transition-[border-color,box-shadow,background-color] duration-200 outline-none hover:border-[var(--border-paper)] focus-visible:border-[var(--border-moss)] focus-visible:bg-[var(--bg-paper)] focus-visible:ring-[3px] focus-visible:ring-[rgba(95,123,56,0.14)] disabled:cursor-not-allowed disabled:opacity-50 resize-none placeholder:text-[var(--ink-muted)]",
        className
      )}

      {...props}
    />
  );
}

export { Textarea };
