import React, { useEffect, useRef, useState } from "react";
import { AppDispatch } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import {
  getCustomerPricesAsync,
  importCustomerProducts,
  updateCustomerPriceAsync,
} from "@/redux/slices/productSlice";
import { useToastActions } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { useParams } from "react-router-dom";
import CustomerProductTable from "./CustomerPricesTable";
import { UpdatePriceModal } from "../modals/UpdatePriceModal";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { DeleteProductModal } from "../modals/DeleteProductModal";
import { deleteProductsAsync, getCustomerAsync, updateCustomerTaxStatusAsync } from "@/redux/slices/customerSlice";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";


interface Product {
  _id: string;
  partNo: string;
  unitPrice: number;
  customerPrice: number;
  name: string;
  image?: string;
}

interface ProductState {
  customerPrices: Product[];
  loading: boolean;
  error: string | null;
}

const CustomerProductsPrices: React.FC = () => {
  const { errorToast, success } = useToastActions();
  const [filterText, setFilterText] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string; }>();
  const [isDialogOpen, setDialogeOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAllSelected, setAllSelected] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [updatePriceData, setUpdatePriceData] = useState<{
    productId: string;
    customerPrice: number;
  }>({ productId: "", customerPrice: 0 });
  const { customerPrices, loading, error } = useSelector((state: { product: ProductState; }) => state.product);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { customer } = useSelector((state: any) => state.customer);
  console.log("🚀 ~ customer:", customer);
  useEffect(() => {
    if (id) {
      dispatch(getCustomerPricesAsync({ userId: id }));
      dispatch(getCustomerAsync({ customerId: id }));
    }
  }, []);

  useEffect(() => {
    if (error) {
      errorToast(error);
    }
  }, [error]);

  const updateCustomerPrice = async (price: number) => {
    try {
      if (id) {
        const customerPriceData = {
          productId: updatePriceData.productId,
          customerId: id,
          price,
        };
        await dispatch(updateCustomerPriceAsync(customerPriceData)).unwrap();
        setDialogeOpen(false);
        success("Price updated.");
        dispatch(getCustomerPricesAsync({ userId: id }));
      }
    } catch (error) {
      console.log("🚀 ~ updateCustomerPrice ~ error:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && id) {
      await dispatch(importCustomerProducts({ file: e.target.files[0], customerId: id })).unwrap();
      success("Products imported.");
      dispatch(getCustomerPricesAsync({ userId: id }));
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden file input click
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const onConfirm = async () => {
    if (selectedProducts.length > 0 && id) {
      await dispatch(deleteProductsAsync({ productIds: selectedProducts, userId: id })).unwrap();
      success("Products deleted.");
      dispatch(getCustomerPricesAsync({ userId: id }));
    }
  };

  const handleTaxToggle = async () => {
    try {
      if (id) {
        await dispatch(updateCustomerTaxStatusAsync({ customerId: id, status: !customer?.taxEnabled })).unwrap();
        success("Tax status updated successfully");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log("🚀 ~ handleTaxToggle ~ error:", error);
      errorToast("Failed to update tax status");
    }
  };

  return (
    <div className="p-6">
      <Spinner show={loading} fullScreen />
      <div className="w-full">
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
              <img src="/icons/search.svg" alt="search" />
            </div>
          </div>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="imageUpload"
          />
          <div className="flex gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="tax-toggle"
                checked={customer?.taxEnabled}
                onCheckedChange={handleTaxToggle}
              />
              <Label htmlFor="tax-toggle">Apply Tax</Label>
            </div>
            <Button onClick={handleButtonClick} className="min-w-[130px]" size="lg">
              Import Products
            </Button>
            {selectedProducts.length > 0 && (
              <Button onClick={handleDelete} className="min-w-[130px]" size="lg">
                Delete Products
              </Button>
            )}
          </div>
        </div>
        <div className="rounded-md border">
          <UpdatePriceModal
            open={isDialogOpen}
            updatePrice={(price: number) => updateCustomerPrice(price)}
            customerPrice={updatePriceData.customerPrice}
            onOpenChange={setDialogeOpen}
          />
          <DeleteProductModal
            onConfirm={onConfirm}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          />
          <CustomerProductTable
            isAllSelected={isAllSelected}
            selectAll={(isSelected) => {
              console.log(customerPrices);
              if (isSelected) {
                setAllSelected(true);
                setSelectedProducts(customerPrices.map(x => x._id));
              } else {
                setAllSelected(false);
                setSelectedProducts([]);
              }
            }}
            setSelectedProducts={(isSelected, product) => {
              if (isSelected) {
                setSelectedProducts([...selectedProducts, product._id]);
              } else {
                const prodIndex = selectedProducts.findIndex((x) => x === product._id);
                const products = JSON.parse(JSON.stringify(selectedProducts));
                products.splice(prodIndex, 1);
                setSelectedProducts(products);
              }
            }}
            selectedProducts={selectedProducts}
            filterText={filterText}
            setFilterText={setFilterText}
            editPrice={(productId: string, customerPrice: number) => {
              setUpdatePriceData({ productId, customerPrice });
              setDialogeOpen(true);
            }}
            customerPrices={customerPrices}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerProductsPrices;
