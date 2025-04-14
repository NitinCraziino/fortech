"use client";

import { Button } from "@/components/ui/button";
import CustomDialog from "@/components/ui/custom-dialog";

interface DeleteProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteProductModal({ open, onOpenChange, onConfirm }: DeleteProductModalProps) {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      content={
        <div>
          <h2 className="text-xl font-semibold mb-2">Delete Product</h2>
          <p className="text-gray-600 mb-6">Are you sure, you want to delete this product?</p>
          <div className="flex justify-center items-center gap-3">
            <Button
              variant="outline"
              className="min-w-[130px]"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              Yes
            </Button>
            <Button className="min-w-[130px]" onClick={() => onOpenChange(false)}>
              No
            </Button>
          </div>
        </div>
      }
    />
  );
}
