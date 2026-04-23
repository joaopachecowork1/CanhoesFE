import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("field-base field-sizing-content min-h-24 rounded-[var(--radius-md-token)] font-[var(--font-body)] resize-none", className)}
      {...props}
    />
  );
}

export { Textarea };
