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
import { ChevronsUpDown, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";

export type Order = {
  _id: string;
  products: {
    productId: {
      _id: string;
      partNo: string;
      description: string;
      image: string;
    };
    quantity: number;
    price: number;
  };
  userId: {
    name: string;
    email: string;
  };
  orderNo: string;
  pickupLocation: string;
  totalPrice: number;
  comments: string;
  deliveryDate: Date | null;
  poNumber: string;
};

export function OrdersTable(props: {
  orders: Order[];
  viewOrder: (id: string) => void;
  isAdmin: boolean;
  filterText: string;
  setFilterText: (e: string) => void;
  pageIndex: number;
  pageSize: number;
  isAllSelected: boolean;
  selectAll: (e: boolean) => void;
  setSelectedOrders: (e: boolean, order: string) => void;
  selectedOrders: string[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const getCols = () => {
    const columns: ColumnDef<Order>[] = props.isAdmin
      ? [
        {
          id: "select-col",
          header: () => {
            return <Checkbox checked={props.isAllSelected} onCheckedChange={(e: boolean) => props.selectAll(e)} />;
          },
          cell: ({ row }) => (
            <Checkbox
              onCheckedChange={(e: boolean) => props.setSelectedOrders(e, row.original._id)}
              checked={props.selectedOrders.find((x) => x === row.original._id) ? true : false}
            />
          ),
        },
        {
          accessorKey: "orderNo",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="flex items-center gap-2"
              >
                Order Number
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => <div className="ms-4">{row.getValue("orderNo")}</div>,
        },
        {
          accessorKey: "poNumber",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="flex items-center gap-2"
              >
                PO #
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => <div className="ms-4">{row.getValue("poNumber") || "N/A"}</div>,
        },
        {
          accessorKey: "deliveryDate",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="flex items-center gap-2"
              >
                Delivery Date
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => <div className="ms-4">{row.getValue("deliveryDate") ? formatDate(row.getValue("deliveryDate")) : 'N/A'}</div>,
        },
        {
          accessorKey: "pickupLocation",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="flex items-center gap-2"
              >
                Shipping Address
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => <div className="ms-4">{row.getValue("pickupLocation")}</div>,
        },
        {
          accessorKey: "userId",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="flex items-center gap-2"
              >
                Customer Name
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => <div className="ms-4">{row.original.userId.name}</div>,
        },
        {
          accessorKey: "totalPrice",
          header: () => {
            return <div className="text-center">Total Amount</div>;
          },
          cell: ({ row }) => <div className="text-center">$ {row.getValue("totalPrice")}</div>,
        },
        {
          id: "actions",
          header: () => {
            return <div className="text-center">Actions</div>;
          },
          enableHiding: false,
          cell: ({ row }) => {
            return (
              <div className="flex items-center justify-center">
                <Button
                  onClick={() => props.viewOrder(row.original._id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        },
      ]
      : [
        {
          accessorKey: "orderNo",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="flex items-center gap-2"
              >
                Order Number
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => <div className="ms-4">{row.getValue("orderNo")}</div>,
        },
        {
          accessorKey: "poNumber",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="flex items-center gap-2"
              >
                PO #
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => <div className="ms-4">{row.getValue("poNumber") || "N/A"}</div>,
        },
        {
          accessorKey: "deliveryDate",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="flex items-center gap-2"
              >
                Delivery Date
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => <div className="ms-4">{row.getValue("deliveryDate") ? formatDate(row.getValue("deliveryDate")) : 'N/A'}</div>,
        },
        {
          accessorKey: "pickupLocation",
          header: ({ column }) => {
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="flex items-center gap-2"
              >
                Shipping Address
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            );
          },
          cell: ({ row }) => <div className="ms-4">{row.getValue("pickupLocation")}</div>,
        },
        {
          accessorKey: "totalPrice",
          header: () => {
            return <div className="text-center">Total Amount</div>;
          },
          cell: ({ row }) => <div className="text-center">$ {row.getValue("totalPrice")}</div>,
        },
        {
          id: "actions",
          header: () => {
            return <div className="text-center">Actions</div>;
          },
          enableHiding: false,
          cell: ({ row }) => {
            return (
              <div className="flex items-center justify-center">
                <Button
                  onClick={() => props.viewOrder(row.original._id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        },
      ];
    return columns;
  };

  const table = useReactTable({
    data: props.orders,
    columns: getCols(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      if (typeof value === "string") {
        return value.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (typeof value === "number") {
        return value.toString().includes(filterValue);
      }
      return false;
    },
    onGlobalFilterChange: props.setFilterText,
    state: {
      globalFilter: props.filterText,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex: props.pageIndex - 1, pageSize: props.pageSize }
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={getCols().length} className="h-24 text-center">
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
