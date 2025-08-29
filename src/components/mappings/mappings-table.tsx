"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, Trash2, Pencil } from "lucide-react";

import { Mapping, Tenant } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MappingForm } from "./mapping-form";
import { deleteMapping } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent } from "@/components/ui/card";

interface MappingsTableProps {
  mappings: Mapping[];
  tenants: Tenant[];
}

export function MappingsTable({ mappings, tenants }: MappingsTableProps) {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const { toast } = useToast();

  const tenantsMap = React.useMemo(() => 
    tenants.reduce((acc, tenant) => {
      acc[tenant.id] = tenant.tenantName;
      return acc;
    }, {} as Record<string, string>),
  [tenants]);

  const handleDelete = async (id: string) => {
    const result = await deleteMapping(id);
     if (result.error) {
      toast({ variant: 'destructive', title: "Error", description: result.error });
    } else {
      toast({ title: "Success", description: result.message });
    }
  };

  const columns: ColumnDef<Mapping>[] = [
    {
      accessorKey: "senderName",
      header: "Sender Name",
    },
    {
      accessorKey: "tenantId",
      header: "Mapped To",
      cell: ({ row }) => {
        const tenantId = row.getValue("tenantId") as string;
        return tenantsMap[tenantId] || "Unknown Tenant";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const mapping = row.original;
        const [isEditOpen, setIsEditOpen] = React.useState(false);

        return (
          <div className="text-right">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DialogTrigger asChild>
                      <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                    </DialogTrigger>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                         <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Mapping</DialogTitle>
                  </DialogHeader>
                  <MappingForm
                    mapping={mapping}
                    tenants={tenants}
                    onSuccess={() => setIsEditOpen(false)}
                  />
                </DialogContent>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      mapping.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(mapping.id)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Dialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: mappings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <PageHeader title="Internal Mappings">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Mapping
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Mapping</DialogTitle>
            </DialogHeader>
            <MappingForm tenants={tenants} onSuccess={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <p className="mb-6 text-muted-foreground">
        Map alternate sender names to a canonical tenant.
      </p>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No mappings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
