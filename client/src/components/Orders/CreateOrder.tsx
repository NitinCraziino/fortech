"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CalendarIcon, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { getCustomerProductsAsync } from "@/redux/slices/productSlice";
import { createOrderAsync } from "@/redux/slices/orderSlice";
import { useNavigate } from "react-router-dom";
import { useToastActions } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

// Define tax rate constant - can be moved to a config file later
const TAX_RATE = 0.06; // 6% tax rate

interface ProductRow {
  productId: string;
  price: number;
  quantity: number;
  amount: number;
}

interface Product {
  _id: string;
  partNo: string;
  unitPrice: number;
  unitOfMeasure: string;
  description: string;
  active: boolean;
  image: string;
  customerPrice: number;
}

interface ProductError {
  idError: string | null; // Error message for Product ID
  quantityError: string | null; // Error message for Quantity
}

interface OrderDetailError {
  poNumber: string | null; // Error message for Product ID
  pickupLocation: string | null; // Error message for Quantity
}

interface OrderDetails {
  poNumber: string;
  deliveryDate: Date;
  pickupLocation: string;
  comments: string;
}

const INITIAL_ROW: ProductRow = {
  productId: "",
  price: 0,
  quantity: 1,
  amount: 0,
};

export default function CreateOrder() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(getCustomerProductsAsync({}));
  }, []);
  const { success, errorToast } = useToastActions();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error, loading } = useSelector((state: any) => state.order);
  useEffect(() => {
    if (error) {
      errorToast(error);
    }
  }, [error]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { products, orderProducts } = useSelector((state: any) => state.product);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);
  // Extract taxEnabled from customer object
  const taxEnabled = user?.taxEnabled || false;

  const [orderFormData, setOrderFormData] = useState<OrderDetails>({
    poNumber: "",
    deliveryDate: new Date(),
    comments: "",
    pickupLocation: "",
  });

  const [rows, setRows] = useState<ProductRow[]>([{ ...INITIAL_ROW }]);
  const [errors, setErrors] = useState<ProductError[]>([{ idError: null, quantityError: null }]);
  const [orderError, setOrderErrors] = useState<OrderDetailError>({
    poNumber: null,
    pickupLocation: null,
  });

  const [subTotal, setSubTotal] = useState<number>(0);
  const [taxTotal, setTaxTotal] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const calculateTotal = (rowsData: ProductRow[]) => {
    // Calculate subtotal from all rows
    const sub = rowsData.reduce((sum, row) => {
      return sum + row.amount;
    }, 0);

    // Calculate tax on the subtotal if tax is enabled
    const tax = taxEnabled ? Number((sub * TAX_RATE).toFixed(2)) : 0;

    // Calculate total price (subtotal + tax)
    const total = sub + tax;

    setSubTotal(sub);
    setTaxTotal(tax);
    setTotalPrice(total);
  };

  // Update amount only calculates price * quantity without tax
  const updateAmount = (price: number, quantity: number) => {
    const numPrice = price || 0;
    const numQuantity = quantity || 0;
    const calculatedAmount = numPrice * numQuantity;
    return Number(calculatedAmount.toFixed(2));
  };

  useEffect(() => {
    if (orderProducts.length) {
      const rowData: ProductRow[] = orderProducts.map((product: Product) => {
        return {
          price: product.customerPrice,
          quantity: 1,
          productId: product._id,
          amount: updateAmount(product.customerPrice, 1),
        };
      });
      setRows(rowData);
      calculateTotal(rowData);
    }
  }, [orderProducts, taxEnabled, user]);

  const handleAddRow = () => {
    setRows([...rows, { ...INITIAL_ROW }]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleProductChange = (productId: string, index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productData = products.find((x: any) => x._id === productId);
    if (productData) {
      const price = productData.customerPrice;
      const rowsData: ProductRow[] = JSON.parse(JSON.stringify(rows));
      rowsData[index]["price"] = price;
      rowsData[index]["productId"] = productId;
      rowsData[index]["amount"] = updateAmount(price, rowsData[index].quantity);
      setRows(rowsData);
      calculateTotal(rowsData);
    }
    setErrors((prevErrors) =>
      prevErrors.map((error, i) => (i === index ? { ...error, [`idError`]: null } : error))
    );
  };

  const handleQuantityChange = (index: number, value: number) => {
    const rowsData: ProductRow[] = JSON.parse(JSON.stringify(rows));
    rowsData[index]["quantity"] = value;
    rowsData[index]["amount"] = updateAmount(rowsData[index].price, value);
    setRows(rowsData);
    calculateTotal(rowsData);
    setErrors((prevErrors) =>
      prevErrors.map((error, i) => (i === index ? { ...error, [`quantityError`]: null } : error))
    );
  };

  const validateProducts = (): boolean => {
    const newErrors = rows.map((product) => ({
      idError: product.productId ? null : "Product is required.",
      quantityError: product.quantity > 0 ? null : "Quantity must be at least 1.",
    }));

    setErrors(newErrors);

    // Check if there are any validation errors
    return newErrors.every((error) => !error.idError && !error.quantityError);
  };

  const validateField = (fieldName: string) => {
    let error = "";
    if (fieldName === "pickupLocation") {
      if (!orderFormData.pickupLocation.trim()) {
        error = "Shipping address is required.";
      }
    }

    setOrderErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: error,
    }));
  };

  const handleBlur = (fieldName: string) => {
    validateField(fieldName);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const fieldNames = ["pickupLocation"];

    fieldNames.forEach((field) => {
      validateField(field);
      if (errors[field as keyof typeof errors]) {
        isValid = false;
      }
      if (orderError[field as keyof typeof orderError]) {
        console.log("Order error", orderError[field as keyof typeof orderError]);
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !validateProducts()) {
      console.log("Validation failed.");
      return;
    }
    try {
      await dispatch(
        createOrderAsync({
          products: rows,
          userId: user._id,
          pickupLocation: orderFormData.pickupLocation,
          totalPrice: totalPrice.toFixed(2),
          poNumber: orderFormData.poNumber,
          comments: orderFormData.comments,
          deliveryDate: orderFormData.deliveryDate,
          taxApplied: taxEnabled,
        })
      ).unwrap();
      success("Order placed.");
      navigate("/orders");
    } catch {
      errorToast("Error placing order");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setOrderFormData({
      ...orderFormData,
      [name]: value,
    });
  };

  return (
    <div className="p-6 mx-auto">
      <Spinner show={loading} fullScreen />
      <div className="flex items-center gap-4 mb-6">
        <Button onClick={() => navigate("/orders")} variant="outline" size="icon" className="h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {/* <h1 className="text-2xl font-medium">Create Order</h1> */}
      </div>

      <div className="max-w-[900px] w-full mb-6">
        <h1 className="text-2xl font-medium">Product Details</h1>
        <Card className="flex flex-col gap-4 mb-6 bg-[#F2F2F2] border-none shadow-none p-4">
          <div className="p-4 bg-white rounded-lg border border-input">
            <div className="grid grid-cols-[minmax(200px,2fr),120px,minmax(200px,2fr),120px,80px] gap-4 mb-2 relative">
              <div className="text-sm font-medium">Product</div>
              <div className="text-sm font-medium">Price</div>
              <div className="text-sm font-medium">Quantity</div>
              <div className="text-sm font-medium">Amount</div>
              <div className="text-sm font-medium text-center">Action</div>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(200px,2fr),120px,minmax(200px,2fr),120px,80px] gap-4 relative"
                >
                  <div className="flex flex-col gap-1">
                    <Select
                      value={row.productId}
                      onValueChange={(value) => {
                        handleProductChange(value, index);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product: { _id: string; partNo: string; description: string; }) => {
                          return (
                            <SelectItem key={product._id} value={product._id}>
                              {product.partNo} ({product.description})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors[index]?.idError && (
                      <span className="text-xs text-destructive">{errors[index].idError}</span>
                    )}
                  </div>

                  <Input readOnly className="w-full" value={row.price} placeholder="Enter price" />

                  <Input
                    min={1}
                    onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                    value={row.quantity}
                    className="w-full"
                    type="number"
                    step={1}
                    placeholder="Enter Quantity"
                  />
                  {errors[index]?.quantityError && (
                    <span className="text-xs text-destructive">{errors[index].quantityError}</span>
                  )}
                  <Input className="w-full" value={row.amount} readOnly />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRow(index)}
                    disabled={rows.length === 1}
                    className="mx-auto"
                  >
                    {/* <Trash2 className="h-6 w-6" /> */}
                    <img src="icons/delete.svg" alt="delete" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" className="mt-4" onClick={handleAddRow}>
              <SquarePlus className="h-5 w-5 mr-2" />
              Add More Products
            </Button>
          </div>

          <div className="flex flex-col items-end bg-white rounded-lg border border-input w-fit ms-auto">
            <div className="flex items-center">
              <span className="flex items-center justify-center text-sm font-medium py-3 px-6 min-w-[130px]">
                $ {subTotal.toFixed(2)}
              </span>
              <span className="flex items-center justify-center text-sm font-medium py-3 px-6 min-w-[130px]">
                Subtotal
              </span>
            </div>
            {taxEnabled && (
              <div className="flex items-center border-t border-input">
                <span className="flex items-center justify-center text-sm font-medium py-3 px-6 min-w-[130px]">
                  $ {taxTotal.toFixed(2)}
                </span>
                <span className="flex items-center justify-center text-sm font-medium py-3 px-6 min-w-[130px]">
                  Tax ({(TAX_RATE * 100).toFixed(0)}%)
                </span>
              </div>
            )}
            <div className="flex items-center border-t border-input font-semibold">
              <span className="flex items-center justify-center text-sm py-3 px-6 min-w-[130px]">
                $ {totalPrice.toFixed(2)}
              </span>
              <span className="flex items-center justify-center text-sm py-3 px-6 min-w-[130px]">
                Total
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-[900px] w-full">
        <h1 className="text-2xl font-medium mb-2">Order Details</h1>
        <Card className="flex flex-col gap-4 mb-6 bg-[#F2F2F2] border-none shadow-none p-4">
          <div className="p-4 bg-white rounded-lg border border-input">
            <div className="grid grid-cols-[minmax(225px,1fr),230px,minmax(100px,2fr)] gap-4 mb-2 relative">
              <div className="text-sm font-medium">PO #</div>
              <div className="text-sm font-medium">Delivery Date</div>
              <div className="text-sm font-medium">Shipping Address</div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[minmax(225px,1fr),230px,minmax(100px,2fr)] gap-4 relative">
                <div className="flex flex-col gap-1">
                  <Input
                    name="poNumber"
                    onBlur={() => handleBlur("poNumber")}
                    value={orderFormData.poNumber}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full"
                    placeholder="Enter PO #"
                  />
                  {orderError.poNumber && (
                    <span className="text-xs text-destructive">{orderError.poNumber}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !orderFormData.deliveryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {orderFormData.deliveryDate ? (
                          format(orderFormData.deliveryDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        required={true}
                        mode="single"
                        selected={orderFormData.deliveryDate}
                        onSelect={(date) => {
                          if (date) {
                            setOrderFormData({
                              ...orderFormData,
                              deliveryDate: date,
                            });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-1">
                  <Input
                    name="pickupLocation"
                    onBlur={() => handleBlur("pickupLocation")}
                    value={orderFormData.pickupLocation}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full"
                    placeholder="Enter Shipping Address"
                  />
                  {orderError.pickupLocation && (
                    <span className="text-xs text-destructive">{orderError.pickupLocation}</span>
                  )}
                </div>
              </div>

              <Textarea
                name="comments"
                value={orderFormData.comments}
                onChange={handleInputChange}
                className="w-full"
                placeholder="Comments"
                rows={5}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" onClick={() => navigate("/orders")} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="button">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
