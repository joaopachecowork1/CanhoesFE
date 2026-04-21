"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type HomeAction = {
  label: string;
  href?: string;
  tone?: "default" | "outline" | "secondary";
  onClick?: () => void;
};

type ClickableHomeAction = HomeAction;

export function ActionButton({ action }: Readonly<{ action: ClickableHomeAction }>) {
  return <ActionLinkButton action={action} variant={action.tone ?? "default"} />;
}

export function ActionLinkButton({
  action,
  variant,
}: Readonly<{
  action: ClickableHomeAction;
  variant: "default" | "outline" | "secondary";
}>) {
  const className =
    variant === "outline"
      ? "border-[rgba(212,184,150,0.3)] bg-[rgba(212,184,150,0.08)] text-[var(--bg-paper)] hover:bg-[rgba(212,184,150,0.14)]"
      : undefined;

  if (action.href) {
    return (
      <Button variant={variant} className={className} asChild>
        <Link href={action.href}>
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} className={className} onClick={action.onClick}>
      {action.label}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
