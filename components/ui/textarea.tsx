import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("flex w-full min-w-0 rounded-[0.875rem] border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-base text-[var(--color-text-primary)] shadow-none outline-none transition-colors placeholder:text-[var(--color-text-muted)] hover:border-white/[0.12] focus-visible:border-[rgba(79,99,54,0.5)] focus-visible:bg-white/[0.06] focus-visible:ring-[3px] focus-visible:ring-[rgba(79,99,54,0.18)] disabled:cursor-not-allowed disabled:opacity-50 field-sizing-content min-h-24 rounded-[var(--radius-md-token)] font-[var(--font-body)] resize-none", className)}
      {...props}
    />
  );
}

export { Textarea };
