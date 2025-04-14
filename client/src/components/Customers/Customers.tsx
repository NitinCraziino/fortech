"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { CustomersTable } from "./CustomersTable";
import { InviteCustomerModal } from "../modals/InviteCustomerModal";
import { useDispatch, useSelector } from "react-redux";
import { getCustomersAsync, inviteCustomerAsync } from "@/redux/slices/customerSlice";
import { AppDispatch } from "@/store";
import { useToastActions } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { Pagination } from "../Pagination/Pagination";
interface FormData {
  email: string;
  customerName: string;
  products: File | null
}
const Customers: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { errorToast, success } = useToastActions();
  const dispatch = useDispatch<AppDispatch>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { customers, error, loading } = useSelector((state: any) => state.customer);
  useEffect(() => {
    dispatch(getCustomersAsync({}));
  }, []);

  useEffect(() => {
    if (error) {
      errorToast(error);
    }
  }, [error]);

  const handleInviteCustomer = async (formData: FormData) => {
    try {
      await dispatch(inviteCustomerAsync(formData)).unwrap();
      setIsDialogOpen(false);
      success("Invitation sent.");
    } catch (error) {
      console.log("🚀 ~ handleInviteCustomer ~ error:", error);
    }
  };

  return (
    <>
      <div className="p-6">
        <Spinner show={loading} fullScreen />
        <div className="flex gap-6 mb-6">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search"
              className="focus-visible:outline-none ps-10 !h-10"
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-5">
              <img src="icons/search.svg" alt="search" />
            </div>
          </div>
          <div>
            <Button size="lg" className="px-[22px]" onClick={() => setIsDialogOpen(true)}>
              Invite Customer
            </Button>
          </div>
        </div>
        <div className="relative">
          <CustomersTable  pageIndex={currentPage} pageSize={rowsPerPage} customers={customers} />
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(customers.length / rowsPerPage)}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(e: number) => {
              setRowsPerPage(e);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <InviteCustomerModal
        inviteCustomer={handleInviteCustomer}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
};

export default Customers;
