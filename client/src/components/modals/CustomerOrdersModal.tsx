"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";
import { AppDispatch } from "@/store";
import { clearCustomerOrders, getCustomerOrdersAsync } from "@/redux/slices/orderSlice";

interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface CustomerOrder {
  _id: string;
  orderNo: string;
  poNumber?: string;
  deliveryDate?: string | null;
  pickupLocation: string;
  totalPrice: number;
  status?: "Processing" | "Fulfilled";
  isDeleted?: boolean;
}

interface CustomerOrdersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function CustomerOrdersModal({ open, onOpenChange, customer }: CustomerOrdersModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { customerOrders, customerOrdersLoading } = useSelector((state: any) => state.order);

  useEffect(() => {
    if (open && customer?._id) {
      setFilterText("");
      dispatch(getCustomerOrdersAsync({ customerId: customer._id }));
    }
    if (!open) {
      dispatch(clearCustomerOrders());
    }
  }, [open, customer?._id, dispatch]);

  const orders: CustomerOrder[] = useMemo(() => {
    const list: CustomerOrder[] = (customerOrders || []).filter((o: CustomerOrder) => !o.isDeleted);
    const query = filterText.trim().toLowerCase();
    if (!query) return list;
    return list.filter((order) =>
      [order.orderNo, order.poNumber, order.pickupLocation]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query))
    );
  }, [customerOrders, filterText]);

  const handleViewOrder = (orderId: string) => {
    onOpenChange(false);
    navigate(`/view-order/${orderId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Orders {customer?.name ? `– ${customer.name}` : ""}</DialogTitle>
          <DialogDescription>
            {customer?.email
              ? `All orders placed by ${customer.email}`
              : "All orders placed by this customer"}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            type="text"
            placeholder="Search by order number, PO # or shipping address"
            className="focus-visible:outline-none ps-10 !h-10"
          />
          <div className="absolute top-1/2 -translate-y-1/2 left-3">
            <img src="icons/search.svg" alt="search" />
          </div>
        </div>

        <div className="relative max-h-[60vh] overflow-auto rounded-md border">
          {customerOrdersLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
              <Spinner show size="large" />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>PO #</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Shipping Address</TableHead>
                <TableHead className="text-center">Total Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length ? (
                orders.map((order) => {
                  const isFulfilled = order.status === "Fulfilled";
                  return (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderNo}</TableCell>
                      <TableCell>
                        <Badge variant={isFulfilled ? "fulfilled" : "processing"}>
                          {isFulfilled ? "Fulfilled" : "Processing"}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.poNumber || "N/A"}</TableCell>
                      <TableCell>
                        {order.deliveryDate ? formatDate(order.deliveryDate) : "N/A"}
                      </TableCell>
                      <TableCell>{order.pickupLocation}</TableCell>
                      <TableCell className="text-center">$ {order.totalPrice}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          onClick={() => handleViewOrder(order._id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {customerOrdersLoading ? "Loading orders..." : "No orders found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
