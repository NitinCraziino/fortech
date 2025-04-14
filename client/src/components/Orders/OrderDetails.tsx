"use client";

import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { getOrderById } from "@/redux/slices/orderSlice";
import { formatDate } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

interface Product {
  price: number;
  productId: {
    _id: string;
    partNo: string;
    image: string;
    description: string;
  };
  quantity: number;
  comments: string;
  deliveryDate: Date | null;
  pickupLocation: string;
  poNumber: string;
}

interface Order {
  _id: string;
  orderNo: string;
  createdAt: string;
  products: Product[];
  userId: {
    name: string;
    email: string;
  };
  poNumber: string;
  deliveryDate: string | null;
  pickupLocation: string;
  comments: string;
  totalPrice: number;
  subtotal: number;
  taxAmount: number;
  taxApplied: boolean;
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Use the Order interface to type the order state variable
  interface RootState {
    order: {
      order: Order | null;
      loading: boolean;
    };
  }

  const { order, loading } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    if (id) {
      // Use type assertion to ensure id is treated as a string
      dispatch(getOrderById({ _id: id as string }));
    } else {
      // Handle the case where id is undefined
      navigate('/orders');
    }
  }, [id, dispatch, navigate]);
  return (
    <div className="p-6 mx-auto">
      <Spinner show={loading} fullScreen />
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => navigate("/orders")}
          variant="outline"
          size="icon"
          className="h-8 w-8"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-medium">Order Details</h1>
      </div>

      <div className="max-w-[900px] w-full">
        {/* Customer Info Card */}
        <Card className="mb-6 bg-[#F2F2F2] border-none shadow-none">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{order?.userId?.name}</h2>
                <p className="text-sm text-muted-foreground">{order?.userId?.email}</p>
              </div>
              <div className="space-y-1 text-left">
                <p className="text-xl font-medium">Order ID: {order?.orderNo}</p>
                <p className="text-sm font-normal text-muted-foreground">
                  {formatDate(order?.createdAt!)}
                </p>
              </div>
            </div>

            <hr className="border-b-1 border border-gray-300 my-5" />

            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium">
                PO Number: <span className="text-muted-foreground">{order?.poNumber || "N/A"}</span>
              </p>
              <p className="text-lg font-medium">
                Delivery Date:{" "}
                <span className="text-muted-foreground">
                  {order?.deliveryDate ? formatDate(order?.deliveryDate) : "N/A"}
                </span>
              </p>
              <p className="text-lg font-medium">
                Shipping Address:{" "}
                <span className="text-muted-foreground">{order?.pickupLocation}</span>
              </p>
              <p className="text-lg font-medium">
                Comments: <span className="text-muted-foreground">{order?.comments || "N/A"}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Products Section */}
        <Card className="bg-[#F2F2F2] border-none shadow-none">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 flex items-center justify-center rounded shadow-md bg-white">
                <ShoppingCart size={16} className="-rotate-[20deg]" />
              </div>
              <h3 className="font-medium">Products</h3>
            </div>

            {/* Products Table */}
            <div className="bg-[#F2F2F2] rounded-lg p-4">
              <div className="bg-white rounded-lg  text-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b  border-gray-100 [&>th]:font-medium text-[#71717A]">
                      <th className="p-4 text-left">Part No.</th>
                      <th className="p-4 text-left">Description</th>
                      <th className="p-4 text-left">Price</th>
                      <th className="p-4 text-left">Quantity</th>
                      <th className="p-4 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {order?.products.map((product: Product, index: number) => {
                      return (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="p-4 flex gap-2 items-center">
                            {product.productId.image && product.productId.image !== "" && (
                              <img
                                src={`https://www.naisorders.com${product.productId.image}`}
                                alt="product"
                                className="rounded-full h-8 w-8"
                              />
                            )}
                            {product.productId.partNo}
                          </td>
                          <td className="p-4">{product.productId.description}</td>
                          <td className="p-4">$ {product.price}</td>
                          <td className="p-4 ">{product.quantity}</td>
                          <td className="p-4 ">{product.price * product.quantity}</td>
                        </tr>
                      );
                    })}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td colSpan={6} height={20} className="bg-gray-100 "></td>
                    </tr>
                    <tr>
                      <td colSpan={2}></td>
                      <td colSpan={2} className="p-4 text-right font-medium">
                        Total Items:
                      </td>
                      <td className="p-4">
                        {order?.products.reduce((sum: number, accu: Product) => {
                          const quantity = accu.quantity;
                          return sum + quantity;
                        }, 0)}
                      </td>
                    </tr>
                    {order?.taxApplied && (
                      <>
                        <tr>
                          <td colSpan={2}></td>
                          <td colSpan={2} className="p-4 text-right font-medium">
                            Subtotal:
                          </td>
                          <td className="p-4">$ {order?.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan={2}></td>
                          <td colSpan={2} className="p-4 text-right font-medium">
                            Tax:
                          </td>
                          <td className="p-4">$ {order?.taxAmount.toFixed(2)}</td>
                        </tr>
                      </>
                    )}
                    <tr>
                      <td colSpan={2}></td>
                      <td colSpan={2} className="p-4 text-right font-medium">
                        Total:
                      </td>
                      <td className="p-4">$ {order?.totalPrice.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
