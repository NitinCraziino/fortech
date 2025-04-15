import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastActions } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { getCustomersAsync } from "@/redux/slices/customerSlice";
import { assignProductsToCustomersAsync } from "@/redux/slices/productSlice";
import { Customer, CustomerProductPrice } from "../../types/product";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";
import { Product } from "../Products/Products";

interface BulkAssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProducts: Product[];
  setSelectedProducts: Dispatch<SetStateAction<Product[]>>;
}

const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  open,
  onOpenChange,
  selectedProducts,
  setSelectedProducts
}) => {
  const { success, errorToast } = useToastActions();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerPrices, setCustomerPrices] = useState<Record<string, Record<string, number>>>({});
  // const [selectedProducts, setSelectedProducts] = useState(selectedCustomers)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { customers, loading } = useSelector((state: any) => state.customer);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(getCustomersAsync({}));
    }
  }, [open]);

  const handleCustomerSelect = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
      // Remove prices for deselected customer
      const newPrices = { ...customerPrices };
      delete newPrices[customerId];
      setCustomerPrices(newPrices);
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
      // Initialize prices for new customer with product's unitPrice
      const newPrices = { ...customerPrices };
      newPrices[customerId] = {};
      selectedProducts.forEach((product) => {
        newPrices[customerId][product._id] = product.unitPrice;
      });
      setCustomerPrices(newPrices);
    }
  };

  const handlePriceChange = (customerId: string, productId: string, price: number) => {
    const newPrices = { ...customerPrices };
    if (!newPrices[customerId]) {
      newPrices[customerId] = {};
    }
    newPrices[customerId][productId] = price;
    setCustomerPrices(newPrices);
  };


  const handleSubmit = async () => {
    if (selectedCustomers.length === 0) {
      errorToast("Please select at least one customer");
      return;
    }

    // Validate all prices are set
    const hasInvalidPrices = selectedCustomers.some((customerId) =>
      selectedProducts.some((product) => {
        const price = customerPrices[customerId]?.[product._id];
        return !price || price <= 0;
      })
    );

    if (hasInvalidPrices) {
      errorToast("Please set valid prices for all products and customers");
      return;
    }

    try {
      // Convert customerPrices to the format expected by the API
      const assignments: CustomerProductPrice[] = [];
      selectedCustomers.forEach((customerId) => {
        selectedProducts.forEach((product) => {
          assignments.push({
            customerId,
            productId: product._id,
            price: customerPrices[customerId][product._id],
            taxEnabled: product.taxEnabled
          });
        });
      });
      setIsSubmitting(true);
      await dispatch(
        assignProductsToCustomersAsync({
          assignments,
        })
      ).unwrap();
      success("Products assigned successfully");
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      errorToast("Failed to assign products");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaxStatus = (taxEnabled: boolean, productId: string) => {
    // Update the tax status for the product in the selected products
    const updatedProducts = selectedProducts.map(product => {
      if (product._id === productId) {
        return { ...product, taxEnabled };
      }
      return product;
    });

    setSelectedProducts(updatedProducts);
  };

  return (
    <>
      <Spinner fullScreen={true} show={isSubmitting} />
      <Dialog open={open && !isSubmitting} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Products to Customers</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* <div className="grid gap-2">
            <Label>Default Price per Product</Label>
            <Input
            type="number"
            value={defaultPrice}
            onChange={(e) => handleDefaultPriceChange(Number(e.target.value))}
            placeholder="Enter default price"
            />
            </div> */}
            <div className="grid gap-2">
              <Label>Select Customers and Set Prices</Label>
              <div className="max-h-[400px] overflow-y-auto border rounded-md p-2">
                {customers.map((customer: Customer) => (
                  <div key={customer._id} className="mb-4 border-b pb-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id={customer._id}
                        checked={selectedCustomers.includes(customer._id)}
                        onChange={() => handleCustomerSelect(customer._id)}
                      />
                      <label htmlFor={customer._id} className="font-medium">{customer.name}</label>
                    </div>
                    {selectedCustomers.includes(customer._id) && (
                      <div className="ml-4 grid gap-2">
                        {selectedProducts.map((product) => (
                          <div key={product._id} className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2 flex-1">
                              {product.image && (
                                <img
                                  src={`https://www.naisorders.com${product.image}`}
                                  alt={product.name}
                                  className="w-8 h-8 object-contain"
                                />
                              )}
                              <span>{product.name}</span>
                            </div>
                            <div >
                              <label id="taxEnabled" children={"Apply Tax"} className="mr-1 text-center" />
                              <Switch id="taxEnabled" checked={product.taxEnabled}
                                onCheckedChange={(taxStatus: boolean) => handleUpdateTaxStatus(taxStatus, product._id)}
                              />
                            </div>
                            <Input
                              type="number"
                              className="w-24"
                              value={customerPrices[customer._id]?.[product._id]}
                              onChange={(e) =>
                                handlePriceChange(customer._id, product._id, Number(e.target.value))
                              }
                              placeholder="Price"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Assigning..." : "Assign Products"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkAssignModal; 