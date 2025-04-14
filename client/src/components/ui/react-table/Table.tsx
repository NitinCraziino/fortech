import {
  ExpandedState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo } from "react";
import { Pagination } from "./Pagination";
import {
  Table as ReactTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CaretDoubleVerticalIcon from "../../../assets/iconsStatic/caretDoubleVertical.svg";
import { cn } from "@/lib/utils";
const columnHelper = createColumnHelper();
interface TableColumn {
  id: string;
  header: any;
  enableSorting: boolean;
  cell?: any;
}

interface TableProps {
  onCellClick?: (value: string) => void;
  cols: TableColumn[];
  data: any[]; // Update this to the actual data type
  loading: boolean;
  onPaginationChange: any;
  onSortingChange: any;
  pageCount: number;
  pagination: any; // Update this to the actual pagination type
  sorting: any; // Update this to the actual sorting type
  isCompanyList?: boolean;
  pageSizeOptions?: number[];
}
export const Table: React.FC<TableProps> = ({
  cols,
  data,
  onPaginationChange,
  onSortingChange,
  pageCount,
  pagination,
  sorting,
  onCellClick,
  loading,
  isCompanyList,
  pageSizeOptions,
}) => {

  const columns: any = useMemo(
    () =>
      cols.map(({ id, header, enableSorting, cell }) => ({
        ...columnHelper.accessor(id, {
          header,
          ...(cell && { cell }),
        }),
        enableSorting,
      })),
    [cols]
  );
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const newData = data.map((comp) =>
    comp.status ? { ...comp, status: "" } : { ...comp, status: "Pending Login" }
  );

  const tableLib = useReactTable({
    data: isCompanyList ? newData : data,
    columns,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    onPaginationChange,
    onSortingChange,
    getExpandedRowModel: getExpandedRowModel(),
    state: { pagination, sorting, expanded },
    pageCount,
  });
  return (
    <>
      <div className="rounded-md border bg-white">
        <ReactTable className="table">
          <TableHeader className="">
            {tableLib.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="[&>*:nth-child(2)]:text-left [&>*:first-child]:text-left"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    {...(header.column.getCanSort()
                      ? { onClick: header.column.getToggleSortingHandler() }
                      : {})}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                    {header.column.getIsSorted() === "asc" ? (
                      <span>
                        <img
                          src={CaretDoubleVerticalIcon}
                          alt="arrows"
                          className="inline ms-2"
                        />
                      </span>
                    ) : header.column.getIsSorted() === "desc" ? (
                      <span>
                        <img
                          src={CaretDoubleVerticalIcon}
                          alt="arrows"
                          className="inline ms-2"
                        />
                      </span>
                    ) : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tableLib.getRowModel().rows.map((row) => (
              <TableRow
                className={cn(
                  "hover:bg-greenGradient transition-all",
                  row.getIsExpanded() ? "row-expanded" : "",
                  row.getParentRow()
                    ? "sub-row"
                    : row.getCanExpand()
                    ? "parent-row"
                    : "",
                  row.getParentRow() && row.index == 1 ? "last-sub-row" : ""
                )}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    className={
                      !row.getCanExpand() &&
                      !cell.column.getIsLastColumn() &&
                      !!onCellClick
                        ? "cursor-pointer"
                        : ""
                    }
                    onClick={() => {
                      !row.getCanExpand() &&
                      !cell.column.getIsLastColumn() &&
                      !!onCellClick
                        ? onCellClick(
                            !row.getValue("_id")
                              ? cell.row.original._id
                              : row.getValue("_id"))
                        : {};
                    }}
                    key={cell.id}
                  >
                    {row.getCanExpand() ? (
                      <button
                        {...{
                          onClick: row.getToggleExpandedHandler(),
                        }}
                        className="cursor-pointer w-full text-left"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </button>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {!!data && data.length == 0 && !loading && (
              <TableRow>
                <TableCell className="p-3 text-center" colSpan={10}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </ReactTable>
      </div>
      <Pagination placeholder={30} tableLib={tableLib} sizes={pageSizeOptions || [10, 30, 50]} />
    </>
  );
};
