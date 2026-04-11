"use client";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AdminStatusFiltersProps<TFilter extends string> = {
  active: TFilter;
  counts: Record<TFilter, number>;
  labels: Record<TFilter, string>;
  onChange: (filter: TFilter) => void;
  options: readonly TFilter[];
};

export function AdminStatusFilters<TFilter extends string>({
  active,
  counts,
  labels,
  onChange,
  options,
}: Readonly<AdminStatusFiltersProps<TFilter>>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((filterKey) => (
        <Button
          key={filterKey}
          size="sm"
          variant={active === filterKey ? "secondary" : "outline"}
          className={cn(
            "min-h-11 rounded-full px-4",
            active === filterKey
              ? "border-[var(--border-moss)] bg-[var(--moss)] text-white"
              : "border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] text-[var(--ink-secondary)] hover:border-[var(--border-moss)] hover:text-[var(--ink-primary)]"
          )}
          onClick={() => onChange(filterKey)}
        >
          {labels[filterKey]}
          <Badge
            variant={active === filterKey ? "outline" : "secondary"}
            className={cn(
              "ml-2 min-w-5 justify-center px-1.5 text-[11px]",
              active === filterKey
                ? "border-[rgba(255,255,255,0.24)] bg-[rgba(255,255,255,0.12)] text-white"
                : "border-[var(--border-subtle)] bg-[rgba(74,92,47,0.12)] text-[var(--ink-muted)]"
            )}
          >
            {counts[filterKey]}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
