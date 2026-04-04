/**
 * Filter component for proposal search and sorting.
 * Matches the dark paper theme with moose-inspired border colors.
 * Provides unified search input, status filters, and sort options.
 *
 * @param activeFilter - Currently active filter (empty string = no filter)
 * @param onChange - Callback when filter changes
 * @param activeStatus - Currently selected status filter (empty = all statuses)
 * @param onStatusChange - Callback when status filter changes
 * @param sortMode - Currently selected sort mode
 * @param onSortChange - Callback when sort mode changes
 * @example
 * ```tsx
 * <AdminFilters
 *   activeFilter={search}
 *   onChange={handleSearchChange}
 *   activeStatus={status}
 *   onStatusChange={handleStatusChange}
 *   sortMode={sort}
 *   onSortChange={handleSortChange}
 * />
 * ```
 */
export function AdminFilters({
  activeFilter,
  activeStatus,
  onChange,
  onSortChange,
  onStatusChange,
  sortMode,
}: Readonly<{
  activeFilter: string;
  activeStatus: ProposalFilter;
  onChange: (filter: string) => void;
  onStatusChange: (status: ProposalFilter) => void;
  onSortChange: (sort: SortMode) => void;
  sortMode: SortMode;
  activeStatus: ProposalFilter;
}>) {
  const SearchInput = () => (
    <Input
      type="search"
      value={activeFilter}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Buscar propostas..."
      className="flex-1 min-w-0 max-w-md bg-[rgba(18,23,12,0.58)] border-[rgba(212,184,150,0.16)] text-[var(--bg-paper)] placeholder:text-[rgba(245,237,224,0.5)] focus:border-[var(--color-moss)] focus:ring-[rgba(212,184,150,0.18)]"
    />
  );

  const statusOptions: { label: string; value: ProposalFilter }[] = [
    { label: "Todas", value: "" },
    { label: "Aprovadas", value: "approved" },
    { label: "Pendente", value: "pending" },
    { label: "Recusada", value: "rejected" },
  ];

  const sortOptions: { label: string; value: SortMode }[] = [
    { label: "Mais recentes", value: "created" },
    { label: "Menos recentes", value: "created-desc" },
    { label: "Alfabético", value: "name" },
  ];

  return (
    <div className="flex flex-wrap flex-wrap gap-2 items-center">
      <SearchInput />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-[rgba(18,23,12,0.58)] border-[rgba(212,184,150,0.16)] text-[var(--bg-paper)] hover:bg-[rgba(18,23,12,0.65)]"
          >
            Filtro
            <DropdownMenuIndicator className="stroke-[var(--color-accent)]" />
            <DropdownMenuShortcut />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-[rgba(212,184,150,0.2)] bg-[rgba(16,20,11,0.95)] text-[var(--bg-paper)]"
        >
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onStatusChange(option.value)}
              className={
                activeStatus === option.value
                  ? "bg-[rgba(212,184,150,0.15)] text-[var(--bg-paper)]"
                  : ""
              }
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-[rgba(18,23,12,0.58)] border-[rgba(212,184,150,0.16)] text-[var(--bg-paper)] hover:bg-[rgba(18,23,12,0.65)]"
          >
            Ordenar
            <DropdownMenuIndicator className="stroke-[var(--color-accent)]" />
            <DropdownMenuShortcut />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-[rgba(212,184,150,0.2)] bg-[rgba(16,20,11,0.95)] text-[var(--bg-paper)]"
        >
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={
                sortMode === option.value
                  ? "bg-[rgba(212,184,150,0.15)] text-[var(--bg-paper)]"
                  : ""
              }
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
