import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "editorial-shell group relative overflow-hidden rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.12)] bg-[linear-gradient(180deg,rgba(28,35,17,0.98),rgba(14,18,10,0.98))] text-[var(--color-text-primary)] shadow-[0_4px_16px_rgba(0,0,0,0.16),inset_0_1px_0_1px_rgba(255,255,255,0.08)] transition-all duration-300 ease-out hover:-translate-y-[2px] hover:border-[rgba(177,140,255,0.32)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.28),0_0_24px_rgba(177,140,255,0.14)] hover:shadow-[0_0_32px_rgba(177,140,255,0.08)] hover:shadow-[inset_0_1px_0_1px_rgba(255,255,255,0.08)] before:absolute before:inset-0 before:rounded-[var(--radius-lg-token)] before:bg-gradient-to-r before:from-[var(--bark)] before:via-[var(--moss)] before:to-transparent before:opacity-0 before:transition-opacity before:duration-700 before:group-hover:opacity-10 before:group-hover:before:bg-gradient-to-r before:group-hover:before:from-[var(--moss)] before:group-hover:before:via-[var(--bark)] before:group-hover:before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2.5 px-4 pt-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] sm:px-5 sm:pt-5 [.border-b]:pb-4",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("heading-3 text-[var(--color-text-primary)]", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("body-small text-[var(--color-text-muted)]", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 pb-4 sm:px-5 sm:pb-5", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4 pb-4 sm:px-5 sm:pb-5 [.border-t]:pt-4", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
