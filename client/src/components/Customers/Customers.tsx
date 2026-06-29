"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { CustomersTable } from "./CustomersTable";
import { InviteCustomerModal } from "../modals/InviteCustomerModal";
import { CustomerOrdersModal } from "../modals/CustomerOrdersModal";
import { CustomerTaxModal } from "../modals/CustomerTaxModal";
import { useDispatch, useSelector } from "react-redux";
import { getCustomersAsync, inviteCustomerAsync, updateCustomerNameAndEmailAsync } from "@/redux/slices/customerSlice";
import { AppDispatch } from "@/store";
import { useToastActions } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { Pagination } from "../Pagination/Pagination";

interface FormData {
  email: string;
  customerName: string;
  products: File | null;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  active: boolean;
  taxEnabled?: boolean;
  taxAmount?: number;
}

const Customers: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ordersCustomer, setOrdersCustomer] = useState<Customer | null>(null);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [taxCustomer, setTaxCustomer] = useState<Customer | null>(null);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
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
      if (selectedCustomer) {
        await dispatch(inviteCustomerAsync({ ...formData, customerId: selectedCustomer._id })).unwrap();
        success("Reinvitation sent successfully.");
      } else {
        await dispatch(inviteCustomerAsync(formData)).unwrap();
        success("Invitation sent successfully.");
      }
      setIsDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.log("🚀 ~ handleInviteCustomer ~ error:", error);
    }
  };

  const updateCustomerNameAndEmail = async (customerId: string, newName: string, newEmail: string) => {
    try {
      await dispatch(updateCustomerNameAndEmailAsync({ customerId, newName, newEmail })).unwrap();
      dispatch(getCustomersAsync({}));
      success("Customer updated successfully");
    } catch (error) {
      console.log("🚀 ~ updateCustomerNameAndEmail ~ error:", error);
    }
  };

  const handleReinviteCustomer = (customerId: string) => {
    const customer = customers.find((c: Customer) => c._id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsDialogOpen(true);
    }
  };

  const handleOpenInviteModal = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleViewOrders = (customer: Customer) => {
    setOrdersCustomer(customer);
    setIsOrdersModalOpen(true);
  };

  const handleOrdersModalOpenChange = (open: boolean) => {
    setIsOrdersModalOpen(open);
    if (!open) {
      setOrdersCustomer(null);
    }
  };

  const handleManageTax = (customer: Customer) => {
    setTaxCustomer(customer);
    setIsTaxModalOpen(true);
  };

  const handleTaxModalOpenChange = (open: boolean) => {
    setIsTaxModalOpen(open);
    if (!open) {
      setTaxCustomer(null);
    }
  };

  const handleCloseModal = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedCustomer(null);
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
            <Button size="lg" className="px-[22px]" onClick={handleOpenInviteModal}>
              Invite Customer
            </Button>
          </div>
        </div>
        <div className="relative">
          <CustomersTable
            pageIndex={currentPage}
            pageSize={rowsPerPage}
            customers={customers}
            onUpdateNameAndEmail={updateCustomerNameAndEmail}
            onReinviteCustomer={handleReinviteCustomer}
            onViewOrders={handleViewOrders}
            onManageTax={handleManageTax}
          />
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
      {isDialogOpen && (
        <InviteCustomerModal
          inviteCustomer={handleInviteCustomer}
          open={isDialogOpen}
          onOpenChange={handleCloseModal}
          customerToReinvite={selectedCustomer}
        />
      )}
      <CustomerOrdersModal
        open={isOrdersModalOpen}
        onOpenChange={handleOrdersModalOpenChange}
        customer={ordersCustomer}
      />
      <CustomerTaxModal
        open={isTaxModalOpen}
        onOpenChange={handleTaxModalOpenChange}
        customer={taxCustomer}
        onSaved={() => dispatch(getCustomersAsync({}))}
      />
    </>
  );
};

export default Customers;