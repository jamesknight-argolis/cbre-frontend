"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";

import { Check, CheckStatus } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ChecksTableProps {
  checks: Check[];
  tenantsMap: Record<string, string>;
}

const statusVariantMap: Record<CheckStatus, "default" | "secondary" | "destructive" | "outline" | "success"> = {
  Incoming: "outline",
  Processed: "secondary",
  Approved: "success",
  Denied: "destructive",
};

export function ChecksTable({ checks, tenantsMap }: ChecksTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Check>[] = [
    {
      accessorKey: "senderName",
      header: "Sender Name",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as CheckStatus;
        return (
          <Badge variant={statusVariantMap[status]} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "mappedTenantId",
      header: "Mapped To",
      cell: ({ row }) => {
        const tenantId = row.getValue("mappedTenantId") as string | null;
        const isSuggestion = row.original.isSuggestion;
        const tenantName = tenantId ? tenantsMap[tenantId] : "N/A";
        return (
          <div className="flex items-center">
            <span>{tenantName}</span>
            {isSuggestion && (
              <Badge variant="outline" className="ml-2 border-amber-500 text-amber-600">
                Suggestion
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "mappingConfidence",
      header: "Confidence",
      cell: ({ row }) => {
        const confidence = row.getValue("mappingConfidence") as number | null;
        if (confidence === null) return "N/A";
        return `${(confidence * 100).toFixed(0)}%`;
      },
    },
  ];

  const table = useReactTable({
    data: checks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
            <Input
              placeholder="Filter by sender name..."
              value={(table.getColumn("senderName")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("senderName")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
        </div>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
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
                    onClick={() => router.push(`/checks/${row.original.id}`)}
                    className="cursor-pointer"
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No checks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
