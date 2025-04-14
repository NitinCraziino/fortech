"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Button } from "../ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between py-6">
      <div className="flex items-center gap-6">
        <span className="text-sm font-medium">Rows per page</span>
        <Select
          value={rowsPerPage.toString()}
          onValueChange={(value) => onRowsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[70px] shadow-[0px_2px_4px_0px_rgba(30,41,59,0.25)]">
            <SelectValue>{rowsPerPage}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="30">30</SelectItem>
            <SelectItem value="40">40</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 h-8 w-8 rounded-lg disabled:opacity-50"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 h-8 w-8 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 h-8 w-8 rounded-lg disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 h-8 w-8 rounded-lg disabled:opacity-50"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
