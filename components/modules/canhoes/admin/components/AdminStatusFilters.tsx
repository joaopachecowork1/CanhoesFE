"use client";

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
          variant={active === filterKey ? "default" : "outline"}
          className="rounded-full px-4"
          onClick={() => onChange(filterKey)}
        >
          {labels[filterKey]}
          <Badge
            variant="secondary"
            className="ml-2 min-w-5 justify-center px-1.5 text-[11px]"
          >
            {counts[filterKey]}
          </Badge>
        </Button>
      ))}
    </div>
  );
}
