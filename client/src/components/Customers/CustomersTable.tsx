"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronsUpDown, Eye, PencilIcon, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";


export interface Customer  {
  _id: string;
  name: string;
  status: "Active" | "Inactive";
  email: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomersTable(props: any) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const navigate = useNavigate();
  const [editingCustomerId, setEditingCustomerId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleEditClick = (customer: Customer) => {
    setEditingCustomerId(customer._id);
    setEditName(customer.name);
  };

  const handleCancelEdit = () => {
    setEditingCustomerId(null);
    setEditName("");
  };

  const handleSaveEdit = (customerId: string) => {
    if (editName.trim())
      props.onUpdateName(customerId, editName);
    setEditingCustomerId(null);
    setEditName("");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    setEditName(e.target.value);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const getCols = () => {
    const columns: ColumnDef<Customer>[] = [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-2"
            >
              Name
              <ChevronsUpDown size={14} />
            </Button>
          );
        },
        cell: ({ row }) => {
          const customer = row.original;
          if (editingCustomerId === customer._id) {
            return (
              <div className="ms-4">
                <Input
                  ref={inputRef}
                  value={editName}
                  onChange={handleNameChange}
                  className="w-full"
                  autoFocus
                />
              </div>
            );
          }
          return <div className="capitalize ms-4">{row.getValue("name")}</div>;
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-2"
            >
              Email
              <ChevronsUpDown size={14} />
            </Button>
          );
        },
        cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("active") ? 'Active': 'Inactive'}</div>
        ),
      },
      {
        id: "actions",
        header: () => {
          return <div className="text-center">Actions</div>;
        },
        enableHiding: false,
        cell: ({ row }) => {
          const customer = row.original;
          if (editingCustomerId === customer._id) {
            return (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => handleSaveEdit(customer._id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <XCircle className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => navigate(`/customer-prices/${customer._id}`)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleEditClick(customer)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ];
    return columns
  }

  const table = useReactTable({
    data: props.customers,
    columns: getCols(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {pageIndex: props.pageIndex-1, pageSize: props.pageSize}
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
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
                  colSpan={getCols().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
