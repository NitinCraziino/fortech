"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomDialog from "@/components/ui/custom-dialog";
import { Import } from "lucide-react";
import { Link } from "react-router-dom";

interface FormData {
  email: string;
  customerName: string;
  products: File | null;
}

interface InviteCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteCustomer: (formData: FormData) => void;
}

interface FormErrors {
  email?: string;
  customerName?: string;
}

export function InviteCustomerModal({
  open,
  onOpenChange,
  inviteCustomer,
}: InviteCustomerModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    customerName: "",
    products: null,
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    customerName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const validateField = (
    name: string,
    value: string | null | File
  ): string | undefined => {
    if (typeof value !== "string") {
      return undefined;
    }
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        return "Email is required.";
      } else if (!emailRegex.test(value)) {
        return "Invalid email format.";
      }
    }
    if (name === "customerName") {
      if (!value.trim()) {
        return "Customer name is required.";
      }
    }

    return undefined;
  };

  useEffect(() => {
    if (!open) {
      setFormData({ email: "", customerName: "", products: null });
      setErrors({ email: "", customerName: "" });
    }
  }, [open]);

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
        inviteCustomer(formData);
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

    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden file input click
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, products: e.target.files[0] }));
    }
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      content={
        <div>
          <h2 className="text-lg font-semibold mb-1">Invite Customer</h2>
          <p className="text-[#334155] text-sm mb-5">
            Enter the Name & Email address whom you want to invite
          </p>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="imageUpload"
          />
          <div className="flex items-center justify-end gap-10 mb-5">
            <Button
              variant="shadow"
              onClick={handleButtonClick}
              className="min-w-[130px] flex gap-3 items-center justify-center px-4"
              size="lg"
            >
              <Import className="size-10" />
              Import Products
            </Button>

            <Link
            target="_blank"
              to="https://www.naisorders.com/uploads/products_list.csv"
              className="text-[10px] font-medium underline underline-offset-2 text-[#0075FF] hover:text-blue-700 transition-all duration-200"
            >
              Download Products List
            </Link>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Customer name"
              className="w-full"
              required
            />
            {touched.customerName && errors.customerName && (
              <p className="text-xs text-red-500">{errors.customerName}</p>
            )}
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              type="email"
              placeholder="example@email.com"
              className="w-full"
              required
            />
            {touched.email && errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
            <Button
              disabled={isSubmitting}
              type="submit"
              className="w-full mt-1"
            >
              Send Invite
            </Button>
          </form>
        </div>
      }
    />
  );
}
