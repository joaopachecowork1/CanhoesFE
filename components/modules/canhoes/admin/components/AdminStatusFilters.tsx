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
            "rounded-full px-4",
            active === filterKey
              ? "border-[var(--border-purple)] bg-[linear-gradient(180deg,rgba(86,62,122,0.96),rgba(54,39,78,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-purple-sm)]"
              : "border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.84)] text-[var(--text-primary)] hover:border-[var(--border-purple)] hover:text-[var(--bg-paper)]"
          )}
          onClick={() => onChange(filterKey)}
        >
          {labels[filterKey]}
          <Badge
            variant={active === filterKey ? "outline" : "secondary"}
            className={cn(
              "ml-2 min-w-5 justify-center px-1.5 text-[11px]",
              active === filterKey
                ? "border-[rgba(245,237,224,0.24)] bg-[rgba(245,237,224,0.12)] text-[var(--bg-paper)]"
                : "border-[var(--border-purple)] bg-[rgba(177,140,255,0.18)] text-[var(--accent-purple-deep)] shadow-[var(--glow-purple-sm)]"
            )}
          >
            {counts[filterKey]}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
