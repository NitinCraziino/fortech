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
import { ChevronsUpDown, Eye, Pencil, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteProductModal } from "../modals/DeleteProductModal";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

export type Product = {
  name: string;
  _id: string;
  partNo: string;
  unitPrice: number;
  unitOfMeasure: string;
  description: string;
  active: boolean;
  image: string;
  taxEnabled: boolean;
  customerPrice: number;
};

export const ProductsTable = (props: {
  products: Product[];
  isAdmin: boolean;
  updateStatus: (active: boolean, _id: string) => void;
  updateTaxStatus: (taxEnabled: boolean, _id: string) => void;
  filterText: string;
  setFilterText: (e: string) => void;
  setSelectedProducts: (e: boolean, product: Product) => void;
  selectAll: (e: boolean) => void;
  selectedProducts: Product[];
  isAllSelected: boolean;
  pageIndex: number;
  pageSize: number;
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const navigate = useNavigate();

  const getCols = () => {
    const columns: ColumnDef<Product>[] = [
      {
        id: "select-col",
        header: () => {
          return (
            <Checkbox
              checked={props.isAllSelected}
              onCheckedChange={(e: boolean) => props.selectAll(e)}
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            onCheckedChange={(e: boolean) => props.setSelectedProducts(e, row.original)}
            checked={props.selectedProducts.find((x) => x._id === row.original._id) ? true : false}
          />
        ),
      },

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
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          );
        },
        filterFn: "includesString",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 ms-4">
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
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-2"
            >
              Part No.
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          );
        },
        filterFn: "includesString",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 ms-4">
            <span>{row.getValue("partNo")}</span>
          </div>
        ),
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => {
          const { unitPrice, customerPrice } = row.original;
          return <div>$ {props.isAdmin ? unitPrice : customerPrice}</div>;
        },
        filterFn: "inNumberRange",
      },
      {
        accessorKey: "unit",
        header: "Unit of Measure",
        cell: ({ row }) => <div>{row.getValue("unit")}</div>,
        filterFn: "includesString",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate">{row.getValue("description")}</div>
        ),
        filterFn: "includesString",
      }
    ];

    if (props.isAdmin) {
      columns.push(
        {
          id: "taxEnabled",
          header: "Apply Tax",
          cell: ({ row }) => <div>{
            <Switch checked={row.original.taxEnabled}
              onCheckedChange={(e: boolean) => props.updateTaxStatus(e, row.original._id)}
            />
          }</div>,
        }
      );
    }

    columns.push({
      id: "actions",
      header: () => {
        return <div className="text-center">Actions</div>;
      },
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original;
        const handleDelete = () => {
          // Handle delete logic here
          console.log("Deleting product:", product._id);
        };

        return (
          <>
            <div className="flex items-center justify-center gap-2">
              <Button
                onClick={() => navigate(`/view-product/${product._id}`)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {props.isAdmin ? (
                <React.Fragment>
                  <Button
                    onClick={() => navigate(`/edit-product/${product._id}`)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {/* <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button> */}
                  <Switch
                    onCheckedChange={(e: boolean) => props.updateStatus(e, product._id)}
                    checked={product.active}
                  />
                </React.Fragment>
              ) : (
                <Button
                  onClick={() => console.log("Toggle favorite for:", product._id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              )}
            </div>
            <DeleteProductModal
              open={false}
              onOpenChange={(e) => console.log(e)}
              onConfirm={handleDelete}
            />
          </>
        );
      },
    });

    return columns;
  };

  const table = useReactTable({
    data: props.products,
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
      pagination: { pageIndex: props.pageIndex - 1, pageSize: props.pageSize },
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
};
