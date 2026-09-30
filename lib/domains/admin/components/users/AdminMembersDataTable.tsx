"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PublicUserDto } from "@/lib/api/types";

interface AdminMembersDataTableProps {
  data: PublicUserDto[];
  onToggleRole: (member: { id: string; isAdmin: boolean }) => void;
  isPendingRoleChange: boolean;
}

export function AdminMembersDataTable({
  data,
  onToggleRole,
  isPendingRoleChange,
}: AdminMembersDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<PublicUserDto>[] = [
    {
      accessorKey: "displayName",
      header: "Nome",
      cell: ({ row }) => {
        const displayName = row.getValue("displayName") as string | null;
        return (
          <span className="font-semibold text-[var(--ink-primary)]">
            {displayName || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <span className="text-[var(--ink-muted)]">{row.getValue("email")}</span>;
      },
    },
    {
      accessorKey: "isAdmin",
      header: "Estatuto",
      cell: ({ row }) => {
        const isAdmin = row.getValue("isAdmin") as boolean;
        return isAdmin ? <Badge variant="outline">Admin</Badge> : <Badge variant="secondary" className="opacity-50">Membro</Badge>;
      },
    },
    {
      id: "actions",
      header: "Permissões",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <Switch
            aria-label={`Admin: ${member.displayName || member.email}`}
            checked={member.isAdmin}
            disabled={isPendingRoleChange}
            onCheckedChange={() => onToggleRole(member)}
            variant="admin"
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-[var(--radius-md-token)] border border-[rgba(255,255,255,0.14)] bg-[rgba(16,23,11,0.94)] shadow-[0_8px_18px_rgba(0,0,0,0.08)] overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-[rgba(255,255,255,0.1)] hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-[var(--ink-muted)]">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-[var(--ink-muted)]">
                Sem resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
