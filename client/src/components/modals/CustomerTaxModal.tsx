"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AppDispatch } from "@/store";
import { updateCustomerTaxAsync } from "@/redux/slices/customerSlice";
import { useToastActions } from "@/lib/utils";

interface Customer {
  _id: string;
  name: string;
  email: string;
  taxEnabled?: boolean;
  taxAmount?: number;
}

interface CustomerTaxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSaved?: () => void;
}

export function CustomerTaxModal({ open, onOpenChange, customer, onSaved }: CustomerTaxModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { success, errorToast } = useToastActions();
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxAmount, setTaxAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialise the form from the selected customer each time the dialog opens.
  useEffect(() => {
    if (open && customer) {
      setTaxEnabled(!!customer.taxEnabled);
      setTaxAmount(customer.taxAmount != null ? String(customer.taxAmount) : "");
    }
  }, [open, customer?._id]);

  const handleSave = async () => {
    if (!customer) return;

    let amount = 0;
    if (taxEnabled) {
      amount = Number(taxAmount);
      if (taxAmount.trim() === "" || isNaN(amount) || amount < 0 || amount > 100) {
        errorToast("Enter a tax rate between 0 and 100.");
        return;
      }
    }

    try {
      setSaving(true);
      await dispatch(
        updateCustomerTaxAsync({ customerId: customer._id, taxEnabled, taxAmount: amount })
      ).unwrap();
      success("Customer tax updated.");
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.log("🚀 ~ handleSave ~ error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customer Tax {customer?.name ? `– ${customer.name}` : ""}</DialogTitle>
          <DialogDescription>
            When enabled, this customer's tax rate is applied to their orders and overrides the per-product tax.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4 py-2">
          <Label htmlFor="customer-tax-enabled" className="text-sm">Apply tax for this customer</Label>
          <Switch
            id="customer-tax-enabled"
            checked={taxEnabled}
            onCheckedChange={setTaxEnabled}
          />
        </div>

        {taxEnabled && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="customer-tax-rate" className="text-sm">Tax Rate (%)</Label>
            <Input
              id="customer-tax-rate"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              placeholder="e.g. 6"
              className="!h-10"
            />
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
