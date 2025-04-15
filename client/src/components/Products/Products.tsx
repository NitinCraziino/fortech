"use client";

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import { ProductsTable } from "./ProductsTable";
import { Pagination } from "../Pagination/Pagination";
import {
  getCustomerProductsAsync,
  getProductsAsync,
  selectOrderProducts,
  updateProductStatusAsync,
  bulkPriceUpdate,
  toggleProductTaxStatus,
  toggleCustomerProductTaxStatus,
} from "@/redux/slices/productSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { useToastActions } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import BulkAssignModal from "../modals/BulkAssignModal";

export interface Product {
  _id: string;
  name: string;
  partNo: string;
  unitPrice: number;
  unitOfMeasure: string;
  description: string;
  active: boolean;
  taxEnabled: boolean;
  image: string;
  customerPrice: number;
}

const Products: React.FC = () => {
  const { success, errorToast } = useToastActions();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterText, setFilterText] = useState("");
  const [isAllSelected, setAllSelected] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [file, setFile] = useState<File | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { products, error, loading } = useSelector((state: any) => state.product);
  useEffect(() => {
    if (error) {
      errorToast(error);
    }
  }, [error]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);
  useEffect(() => {
    if (user.admin) {
      dispatch(getProductsAsync({}));
    } else {
      dispatch(getCustomerProductsAsync({}));
    }
  }, [user]);
  const handleUpdate = async (active: boolean, productId: string) => {
    try {
      await dispatch(updateProductStatusAsync({ productId, active })).unwrap();
      success("Status updated.");
    } catch (error) {
      console.log(error);
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      try {
        await dispatch(bulkPriceUpdate({ file: e.target.files[0] })).unwrap();
        setFile(null);
        if (user.admin) {
          dispatch(getProductsAsync({}));
        } else {
          dispatch(getCustomerProductsAsync({}));
        }
        success("Bulk update success.");
      } catch (error) {
        console.log("🚀 ~ handleFileChange ~ error:", error);
      }
    }
  };

  const handleTaxStatusUpdate = async (taxEnabled: boolean, productId: string) => {
    try {
      if (user.admin) {
        await dispatch(toggleProductTaxStatus({ productId, taxEnabled })).unwrap();
        dispatch(getProductsAsync({}));
      } else {
        await dispatch(toggleCustomerProductTaxStatus({ productId, taxEnabled, customerId: user._id }));
        dispatch(getCustomerProductsAsync({}));
      }
      success("Tax status updated.");
    } catch (error) {
      console.log(error);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden file input click
    }
  };
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
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
        <div>
          {user.admin ? (
            <div className="flex gap-4 items-center">
              <Button className="min-w-[130px]" size="lg">
                <Link to={"/create-product"}>
                  Create Product
                </Link>
              </Button>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="imageUpload"
              />
              <Button onClick={handleButtonClick} className="min-w-[130px]" size="lg">
                Bulk Update Prices
              </Button>
              {selectedProducts.length > 0 && (
                <Button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="min-w-[130px]"
                  size="lg"
                >
                  Assign to Customers
                </Button>
              )}
            </div>
          ) : (
            <Button
              onClick={() => {
                dispatch(selectOrderProducts(selectedProducts));
                navigate("/create-order");
              }}
              className="px-[22px]"
            >
              Create Order
            </Button>
          )}
        </div>
      </div>
      <div className="relative">
        <ProductsTable
          pageIndex={currentPage}
          pageSize={rowsPerPage}
          isAllSelected={isAllSelected}
          updateTaxStatus={handleTaxStatusUpdate}
          selectAll={(isSelected) => {
            if (isSelected) {
              setAllSelected(true);
              setSelectedProducts([...products]);
            } else {
              setAllSelected(false);
              setSelectedProducts([]);
            }
          }}
          setSelectedProducts={(isSelected, product) => {
            if (isSelected) {
              setSelectedProducts([...selectedProducts, product]);
            } else {
              const prodIndex = selectedProducts.findIndex((x) => x._id === product._id);
              const products = JSON.parse(JSON.stringify(selectedProducts));
              products.splice(prodIndex, 1);
              setSelectedProducts(products);
            }
          }}
          selectedProducts={selectedProducts}
          setFilterText={setFilterText}
          filterText={filterText}
          updateStatus={handleUpdate}
          isAdmin={user.admin}
          products={products}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(products.length / rowsPerPage)}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(e: number) => {
            setRowsPerPage(e);
            setCurrentPage(1);
          }}
        />
      </div>
      <BulkAssignModal
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        setSelectedProducts={setSelectedProducts}
        selectedProducts={selectedProducts}
      />
    </div>
  );
};

export default Products;
