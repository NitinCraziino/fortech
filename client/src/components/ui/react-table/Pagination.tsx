import React from "react";
import { Button } from "../button";
import { LeftArrow } from "@/assets/iconsDynamic";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
interface PaginationProps {
  tableLib: any;
  sizes: number[];
  placeholder?: number;
}
export const Pagination: React.FC<PaginationProps> = ({ tableLib, sizes, placeholder }) => (
  <footer className="pagination">
   {tableLib.getPageCount() > 0 &&  <div className="py-6 text-sm font-medium flex items-center justify-between">
      <div className="flex items-center gap-6">
        <p className="">Rows per page</p>
          
        <Select
          value={tableLib.getState().pageSize}
          onValueChange={(value:string) => tableLib.setPageSize(parseInt(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sizes.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-6">
        <p className="">{`Page ${
          tableLib.getState().pagination.pageIndex + 1
        } of ${tableLib.getPageCount()}`}</p>
        <div className="flex gap-4">
          <div>
            <Button
              disabled={!tableLib.getCanPreviousPage()}
              onClick={() => tableLib.setPageIndex(0)}
              variant="outline"
              className="p-0 h-8 w-8 me-[10px]"
            >
              <LeftArrow />
              <LeftArrow />
            </Button>

            <Button
              disabled={!tableLib.getCanPreviousPage()}
              onClick={tableLib.previousPage}
              variant="outline"
              className="p-0 h-8 w-8"
            >
              <LeftArrow />
            </Button>
          </div>

          <div>
            <Button
              disabled={!tableLib.getCanNextPage()}
              onClick={tableLib.nextPage}
              variant="outline"
              className="p-0 h-8 w-8 rotate-180 me-[10px]"
            >
              <LeftArrow />
            </Button>
            <Button
              disabled={!tableLib.getCanNextPage()}
              onClick={() => tableLib.setPageIndex(tableLib.getPageCount() - 1)}
              variant="outline"
              className="p-0 h-8 w-8 rotate-180"
            >
              <LeftArrow />
              <LeftArrow />
            </Button>
          </div>
        </div>
      </div>
    </div>}
  </footer>
);
