"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Pagination } from "../Pagination/Pagination";
import { OrdersTable } from "./OrdersTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { exportOrderAsync, getAllOrders, getOrdersAsync, fulFillOrdersAsync, deleteOrder } from "@/redux/slices/orderSlice";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { FulfillOrdersDialog } from "../modals/FulfillOrdersDialog";
import { ConfirmDeleteOrder } from "../modals/ComfirmDeleteOrder";
import { useToast } from "@/hooks/use-toast";

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
  isDeleted: boolean;
};

const Orders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState("");
  const [isAllSelected, setAllSelected] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isFulfillDialogOpen, setIsFulfillDialogOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { orders, loading } = useSelector((state: any) => state.order);
  useEffect(() => {
    if (user) {
      if (user.admin) {
        dispatch(getAllOrders({}));
      } else {
        dispatch(getOrdersAsync({ userId: user._id }));
      }
    }
  }, [user]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const { toast } = useToast();

  const handleFulfillOrders = async (orderIds: string[]) => {
    if (!user.admin) return;
    await dispatch(fulFillOrdersAsync({ orderIds }));
    await dispatch(getAllOrders({}));
    const title = orderIds.length > 1 ? "Orders fulfilled successfully" : "Order fulfilled successfully";
    toast({
      title: title,
      variant: "success",
    });
  };

  const handleDelete = async () => {
    if (!user.admin || !deletingOrder) return;
    await dispatch(deleteOrder({ orderId: deletingOrder }));
    await dispatch(getAllOrders({}));
    toast({
      title: "Order Deleted successfully",
      variant: "success",
    });
  };

  return (
    <div className="p-6">
      <Spinner show={loading} fullScreen />
      <div className="flex gap-6 mb-6">
        <div className="relative w-full">
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            type="text"
            placeholder="Search"
            className="focus-visible:outline-none ps-10 !h-10"
          />
          <div className="absolute top-1/2 -translate-y-1/2 left-5">
            <img src="icons/search.svg" alt="search" />
          </div>
        </div>
        {!user.admin && (
          <Button onClick={() => navigate("/create-order")} className="px-[22px] ml-auto">
            Create Order
          </Button>
        )}
        {user.admin && selectedOrders.length > 0 && (
          <>
            <Button onClick={() => dispatch(exportOrderAsync({ orderIds: selectedOrders }))} className="px-[22px] ml-auto">
              Export Orders
            </Button>
            {user.admin && (
              <Button onClick={() => setIsFulfillDialogOpen(true)} className="px-[22px] ml-auto">
                Fulfill Orders
              </Button>
            )}
          </>
        )}
      </div>
      <div className="relative">
        <OrdersTable
          pageIndex={currentPage}
          pageSize={rowsPerPage}
          filterText={filterText}
          setFilterText={setFilterText}
          isAdmin={user.admin}
          viewOrder={(id: string) => navigate(`/view-order/${id}`)}
          orders={orders}
          isAllSelected={isAllSelected}
          selectAll={(isSelected) => {
            if (isSelected) {
              setAllSelected(true);
              const ordersData = orders.map((order: Order) => order._id);
              setSelectedOrders(ordersData);
            } else {
              setAllSelected(false);
              setSelectedOrders([]);
            }
          }}
          setSelectedOrders={(isSelected, orderId) => {
            if (isSelected) {
              setSelectedOrders([...selectedOrders, orderId]);
            } else {
              const orderIndex = selectedOrders.findIndex((x) => x === orderId);
              const orders = JSON.parse(JSON.stringify(selectedOrders));
              orders.splice(orderIndex, 1);
              setSelectedOrders(orders);
            }
          }}
          selectedOrders={selectedOrders}
          handleDelete={(orderId) => {
            setDeletingOrder(orderId);
          }}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(orders.length / rowsPerPage)}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(e: number) => {
            setRowsPerPage(e);
            setCurrentPage(1);
          }}
        />
      </div>
      <FulfillOrdersDialog
        isOpen={isFulfillDialogOpen}
        setOpen={setIsFulfillDialogOpen}
        selectedOrders={selectedOrders}
        onConfirm={handleFulfillOrders}
        isLoading={loading}
      />
      <ConfirmDeleteOrder
        isOpen={!!deletingOrder}
        setOpen={() => setDeletingOrder(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Orders;
