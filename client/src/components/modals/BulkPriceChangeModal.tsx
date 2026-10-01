import React, { useEffect, useMemo, useState } from "react";
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
import {
  bulkUpdateCustomerPricesAsync,
  getProductCustomerPricesAsync,
} from "@/redux/slices/productSlice";
import { Customer } from "../../types/product";
import { Spinner } from "../ui/spinner";
import { Product } from "../Products/Products";

type Mode = "fixed" | "percent";

interface BulkPriceChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

const money = (n: number) => `$${n.toFixed(2)}`;

const BulkPriceChangeModal: React.FC<BulkPriceChangeModalProps> = ({ open, onOpenChange, product }) => {
  const { success, errorToast } = useToastActions();
  const dispatch = useDispatch<AppDispatch>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { customers, loading } = useSelector((state: any) => state.customer);

  const [prices, setPrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>("fixed");
  const [value, setValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setMode("fixed");
    setValue("");
    dispatch(getCustomersAsync({}));
    setPricesLoading(true);
    dispatch(getProductCustomerPricesAsync({ productId: product._id }))
      .unwrap()
      .then((rows) => {
        const map: Record<string, number> = {};
        rows.forEach((r) => {
          map[r.customerId] = r.price;
        });
        setPrices(map);
      })
      .catch((e) => errorToast(typeof e === "string" ? e : "Could not load customer prices."))
      .finally(() => setPricesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product._id]);

  // Only customers who already have this item on their list can be changed.
  const withItem: Customer[] = useMemo(
    () => (customers as Customer[]).filter((c) => prices[c._id] !== undefined),
    [customers, prices]
  );
  const withoutItem = (customers as Customer[]).length - withItem.length;

  const numeric = parseFloat(value);
  const valueValid =
    value.trim() !== "" &&
    Number.isFinite(numeric) &&
    (mode === "fixed" ? numeric >= 0 : numeric > -100);

  const preview = (current: number) => {
    if (!valueValid) return null;
    return mode === "fixed" ? numeric : Number((current * (1 + numeric / 100)).toFixed(2));
  };

  const allSelected = withItem.length > 0 && selected.length === withItem.length;
  const toggleAll = () => setSelected(allSelected ? [] : withItem.map((c) => c._id));
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = async () => {
    if (selected.length === 0) {
      errorToast("Please select at least one customer");
      return;
    }
    if (!valueValid) {
      errorToast(mode === "fixed" ? "Enter a valid price" : "Enter a valid percentage");
      return;
    }
    try {
      setIsSubmitting(true);
      const result = await dispatch(
        bulkUpdateCustomerPricesAsync({ productId: product._id, customerIds: selected, mode, value: numeric })
      ).unwrap();
      success(`Price updated for ${result.updated.length} customer${result.updated.length === 1 ? "" : "s"}.`);
      onOpenChange(false);
    } catch (error) {
      errorToast(typeof error === "string" ? error : "Price update failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Spinner fullScreen={true} show={isSubmitting} />
      <Dialog open={open && !isSubmitting} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Change Customer Prices</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{product.name}</span> ({product.partNo}) &middot; Unit price {money(product.unitPrice)}
            </div>

            <div className="grid gap-2">
              <Label>How to change the price</Label>
              <div className="flex gap-4 items-center flex-wrap">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="price-mode" checked={mode === "fixed"} onChange={() => setMode("fixed")} />
                  Set price to
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="price-mode" checked={mode === "percent"} onChange={() => setMode("percent")} />
                  Change by %
                </label>
                <div className="flex items-center gap-1">
                  {mode === "fixed" && <span className="text-sm">$</span>}
                  <Input
                    type="number"
                    className="w-40"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={mode === "fixed" ? "New price" : "e.g. 5 or -10"}
                    step="0.01"
                    min={mode === "fixed" ? "0" : undefined}
                  />
                  {mode === "percent" && <span className="text-sm">%</span>}
                </div>
              </div>
              {mode === "percent" && (
                <p className="text-xs text-gray-500">Positive raises the price, negative lowers it. Applied to each customer's current price.</p>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Customers with this item</Label>
                {withItem.length > 0 && (
                  <button type="button" className="text-xs text-blue-600 hover:underline" onClick={toggleAll}>
                    {allSelected ? "Clear all" : "Select all"}
                  </button>
                )}
              </div>
              <div className="max-h-[340px] overflow-y-auto border rounded-md">
                {loading || pricesLoading ? (
                  <div className="text-center p-4">Loading customers...</div>
                ) : withItem.length === 0 ? (
                  <div className="text-center p-4 text-sm text-gray-600">No customer has this item yet. Use "Assign to Customers" to add it first.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="w-8 p-2 text-center">
                          <input
                            type="checkbox"
                            title={allSelected ? "Clear all" : "Select all"}
                            checked={allSelected}
                            onChange={toggleAll}
                          />
                        </th>
                        <th className="text-left p-2 font-medium">Customer</th>
                        <th className="text-right p-2 font-medium">Current</th>
                        <th className="text-right p-2 font-medium">New</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withItem.map((c) => {
                        const current = prices[c._id];
                        const next = preview(current);
                        const checked = selected.includes(c._id);
                        return (
                          <tr key={c._id} className="border-t">
                            <td className="p-2 text-center">
                              <input type="checkbox" id={`bp-${c._id}`} checked={checked} onChange={() => toggle(c._id)} />
                            </td>
                            <td className="p-2">
                              <label htmlFor={`bp-${c._id}`} className="cursor-pointer">
                                <div className="font-medium">{c.name}</div>
                                <div className="text-xs text-gray-500">{c.email}</div>
                              </label>
                            </td>
                            <td className="p-2 text-right">{money(current)}</td>
                            <td className={`p-2 text-right ${next === null ? "text-gray-400" : checked ? "font-medium" : "text-gray-400"}`}>
                              {next !== null ? money(next) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              {withoutItem > 0 && !loading && !pricesLoading && (
                <p className="text-xs text-gray-500">
                  {withoutItem} customer{withoutItem === 1 ? " does" : "s do"} not have this item and {withoutItem === 1 ? "is" : "are"} not shown.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || pricesLoading || isSubmitting || selected.length === 0}>
              {isSubmitting ? "Updating..." : `Update ${selected.length || ""} Price${selected.length === 1 ? "" : "s"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkPriceChangeModal;
