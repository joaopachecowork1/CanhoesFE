import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "input-psycho-focus placeholder:text-[var(--text-muted)] flex field-sizing-content min-h-24 w-full rounded-[var(--radius-md-token)] border-2 border-transparent bg-[var(--bg-paper-alt)] px-4 py-3 text-base text-[var(--text-dark)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition-[color,box-shadow,border-color,background-color] outline-none focus-visible:border-[var(--neon-green)] focus-visible:bg-[var(--bg-paper)] focus-visible:[box-shadow:0_0_0_3px_rgba(0,255,136,0.18)] disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
