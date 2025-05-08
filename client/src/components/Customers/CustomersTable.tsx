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
import { ChevronsUpDown, Eye, PencilIcon, CheckCircle, XCircle, MailIcon } from "lucide-react";

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


export interface Customer {
  _id: string;
  name: string;
  active: boolean;
  email: string;
};

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
  const [editEmail, setEditEmail] = React.useState("");
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const emailInputRef = React.useRef<HTMLInputElement>(null);

  const handleEditClick = (customer: Customer) => {
    setEditingCustomerId(customer._id);
    setEditName(customer.name);
    setEditEmail(customer.email);
  };

  const handleCancelEdit = () => {
    setEditingCustomerId(null);
    setEditName("");
    setEditEmail("");
  };

  const handleSaveEdit = (customerId: string) => {
    if (editName.trim() && editEmail.trim())
      props.onUpdateNameAndEmail(customerId, editName, editEmail);
    setEditingCustomerId(null);
    setEditName("");
    setEditEmail("");
  };

  const handleReinviteCustomer = (customerId: string) => {
    if (props.onReinviteCustomer) {
      props.onReinviteCustomer(customerId);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 0);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditEmail(e.target.value);
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
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
                  ref={nameInputRef}
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
        cell: ({ row }) => {
          const customer = row.original;
          if (editingCustomerId === customer._id) {
            return (
              <div>
                <Input
                  ref={emailInputRef}
                  value={editEmail}
                  onChange={handleEmailChange}
                  className="w-full"
                />
              </div>
            );
          }
          return <div className="lowercase">{row.getValue("email")}</div>;
        },
      },
      {
        accessorKey: "active",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-2"
            >
              Status
              <ChevronsUpDown size={14} />
            </Button>
          );
        },
        cell: ({ row }) => {
          const isActive = row.original.active;
          return (
            <div className={`capitalize font-medium`}>
              {isActive ? 'Active' : 'Inactive'}
            </div>
          );
        },
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
              {!customer.active && (
                <Button
                  onClick={() => handleReinviteCustomer(customer._id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MailIcon className="h-4 w-4 text-blue-600" />
                  <span className="sr-only">Resend Customer</span>
                </Button>
              )}
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