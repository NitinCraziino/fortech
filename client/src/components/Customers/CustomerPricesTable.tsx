"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "../ui/button";
import { Pencil } from "lucide-react";
import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Pagination } from "../Pagination/Pagination";

type Product = {
  _id: string;
  partNo: string;
  unitPrice: number;
  customerPrice: number;
  image?: string;
};

const CustomerProductPricesTable = ({
  customerPrices,
  editPrice,
  filterText,
  setFilterText,
  isAllSelected,
  selectAll,
  setSelectedProducts,
  selectedProducts,
}: {
  customerPrices: Product[];
  editPrice: (productId: string, customerPrice: number) => void;
  filterText: string;
  isAllSelected: boolean;
  setFilterText: (e: string) => void;
  selectAll: (e: boolean) => void;
  setSelectedProducts: (checked: boolean, product: Product) => void;
  selectedProducts: string[];
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [pageIndex, setPageIndex] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const getCols = () => {
    const columns: ColumnDef<Product>[] = [
      {
        id: "select-col",
        header: () => {
          return <Checkbox checked={isAllSelected} onCheckedChange={(e: boolean) => selectAll(e)} />;
        },
        cell: ({ row }) => (
          <Checkbox
            onCheckedChange={(e: boolean) => setSelectedProducts(e, row.original)}
            checked={selectedProducts.find((x) => x === row.original._id) ? true : false}
          />
        ),
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 ms-2">
            {row.original.image && row.original.image !== "" && (
              <img
                src={`https://www.naisorders.com${row.original.image}`}
                alt="product"
                className="rounded-full h-8 w-8"
              />
            )}
            <span>{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "partNo",
        header: "Part No",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: (info) => `$${info.getValue()}`,
      },
      {
        accessorKey: "customerPrice",
        header: "Customer Price",
        cell: (info) => `$${info.getValue()}`,
      },
      {
        id: "actions",
        header: () => {
          return <div className="text-center">Actions</div>;
        },
        enableHiding: false,
        cell: ({ row }) => {
          const product = row.original;

          return (
            <>
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => editPrice(product._id, product.customerPrice)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </>
          );
        },
      },
    ];
    return columns;
  };
  const table = useReactTable({
    data: customerPrices,
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
    onGlobalFilterChange: setFilterText,
    state: {
      globalFilter: filterText,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pageIndex - 1, // TanStack Table uses 0-based indexing
        pageSize: rowsPerPage,
      },
    },
    manualPagination: false,
    pageCount: Math.ceil(customerPrices.length / rowsPerPage),
  });

  return (
    <div className="w-full flex flex-col gap-2 items-center">
      <Table className="w-full rounded-md border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
      <div className="w-full px-4">
        <Pagination
          currentPage={pageIndex}
          totalPages={Math.ceil(table.getFilteredRowModel().rows.length / rowsPerPage)}
          rowsPerPage={rowsPerPage}
          onPageChange={(page) => setPageIndex(page)}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setPageIndex(1);
          }}
        />
      </div>
    </div>
  );
};

export default CustomerProductPricesTable;
