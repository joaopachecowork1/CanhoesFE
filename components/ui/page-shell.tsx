import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  wide?: boolean;
}

export const PageShell = React.forwardRef<HTMLDivElement, PageShellProps>(
  ({ className, wide = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full px-4 mx-auto sm:px-6 lg:px-8",
          wide ? "max-w-[72rem]" : "max-w-[60rem]",
          className
        )}
        {...props}
      />
    )
  }
)
PageShell.displayName = "PageShell"
