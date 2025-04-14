"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomDialog from "@/components/ui/custom-dialog";

interface FormData {
  price: number;
}

interface UpdatePriceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updatePrice: (price: number) => void;
  customerPrice: number;
}

interface FormErrors {
  price?: string;
}

export function UpdatePriceModal({
  open,
  onOpenChange,
  updatePrice,
  customerPrice,
}: UpdatePriceModalProps) {
  const [formData, setFormData] = useState<FormData>({ price: 0 });
  const [errors, setErrors] = useState<FormErrors>({ price: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    setFormData({price: customerPrice})
  } , [customerPrice])

  const validateField = (name: string, value: number): string | undefined => {
    if (name === "price") {
      if (!value) {
        return "Invalid price.";
      }
    }

    return undefined;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        console.log("Form submitted:", formData);
        updatePrice(formData.price);
      } catch (error) {
        console.error("Invite error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name, parseFloat(value));
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      content={
        <div>
          <h2 className="text-lg font-semibold mb-1">Customer Specific Price</h2>
          <p className="text-[#334155] text-sm mb-5">Enter price</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="number"
              value={formData.price}
              name="price"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.price && errors.price && (
              <p className="text-xs text-red-500">{errors.price}</p>
            )}
            <Button disabled={isSubmitting} type="submit" className="w-full mt-1">
              Update
            </Button>
          </form>
        </div>
      }
    />
  );
}
