"use client";

import React, { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { createProductAsync, editProductAsync, getProductById } from "@/redux/slices/productSlice";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useToastActions } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

interface Product {
  name: string;
  partNo: string;
  unitPrice: number;
  unitOfMeasure: string;
  description: string;
  image: File | null;
  unit?: string;
  customerPrice?: number;
  inStock?: boolean;
}

const CreateProduct: React.FC = () => {
  const { success, errorToast } = useToastActions();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const isView = location.pathname.includes("/view-product/");
  const isEdit = location.pathname.includes("/edit-product/");
  useEffect(() => {
    if (id && (isView || isEdit)) {
      dispatch(getProductById({ _id: id }));
    }
  }, [id, isView, isEdit]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { product, error, loading } = useSelector((state: any) => state.product);

  useEffect(() => {
    if (product) {
      setFormValues(product);
    }
    if (error) {
      errorToast(error);
    }
  }, [product, error]);

  const [formData, setFormData] = useState<Product>({
    partNo: "",
    unitPrice: 0,
    unitOfMeasure: "",
    description: "",
    image: null,
    name: "",
    inStock: true,
  });


  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    partNo: "",
    unitPrice: "",
    unitOfMeasure: "",
    description: "",
    image: "",
    name: ""
  });

  const setFormValues = (product: Product) => {
    const { partNo, unitPrice, unit, description, image, name, customerPrice, inStock } = product;
    setFormData({
      name,
      partNo,
      unitPrice: customerPrice? customerPrice:unitPrice,
      unitOfMeasure: unit ? unit : "",
      description,
      image: null, // Reset image as it cannot be passed directly (for security reasons)
      inStock: inStock !== undefined ? inStock : true,
    });
    if(image) {
      setImagePreview(`https://www.naisorders.com${image as unknown as string}`);
    }
    
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "unitPrice" ? parseFloat(value) : value,
    });
  };

  const validateField = (fieldName: string) => {
    let error = "";

    switch (fieldName) {
      case "name":
        if (!formData.name.trim()) {
          error = "Product name is required.";
        }
        break;
      case "partNo":
        if (!formData.partNo.trim()) {
          error = "Part number is required.";
        }
        break;
      case "unitPrice":
        if (!formData.unitPrice || formData.unitPrice <= 0) {
          error = "Unit price must be a positive number.";
        }
        break;
      case "unitOfMeasure":
        if (!formData.unitOfMeasure.trim()) {
          error = "Unit of measure is required.";
        }
        break;
      case "description":
        if (!formData.description.trim()) {
          error = "Description is required.";
        }
        break;
      case "image":
        if (!formData.image && !imagePreview) {
          error = "Product image is required.";
        }
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: error,
    }));
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden file input click
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
      });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const fieldNames = ["partNo", "unitPrice", "unitOfMeasure", "description", "image", "name"];

    fieldNames.forEach((field) => {
      validateField(field);
      if (errors[field as keyof typeof errors]) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleBlur = (fieldName: string) => {
    validateField(fieldName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const { partNo, unitPrice, unitOfMeasure, description, image, name, inStock } = formData;
      let result = null;
      try {
        if (isEdit && id) {
          result = await dispatch(
            editProductAsync({
              name,
              partNo,
              unitPrice: unitPrice.toString(),
              unit: unitOfMeasure,
              description,
              image,
              _id: id,
              inStock,
            })
          ).unwrap();
        } else {
          result = await dispatch(
            createProductAsync({
              name,
              partNo,
              unitPrice: unitPrice.toString(),
              unit: unitOfMeasure,
              description,
              image,
              inStock,
            })
          ).unwrap();
        }

        if (result) {
          success(isEdit ? "Product updated." : "Product added.");
          navigate("/products");
        }
      } catch (error) {
        errorToast("Error adding product");
        console.log("🚀 ~ handleSubmit ~ error:", error);
      }
    }
  };

  return (
    <div className="p-6 mx-auto">
      <Spinner show={loading} fullScreen />
      {/* <h1 className="text-2xl font-medium -tracking-[0.48px] mb-6">Create Product</h1> */}

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#F2F2F2] rounded-lg p-4 max-w-[700px]">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white flex items-center justify-center border border-[#CBD5E1]">
            {imagePreview ? (
              <img src={imagePreview} alt="Product" className="object-cover" />
            ) : (
              <span className="text-[10px] text-[#94A3B8]">No image</span>
            )}
          </div>
          {!isView && (
            <div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload">
                <Button
                  onClick={handleButtonClick}
                  type="button"
                  variant="outline"
                  className="bg-white hover:bg-white/80"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </label>
              {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
            <Label htmlFor="partNo" className="text-sm">
              Product Name
            </Label>
            <Input
              id="name"
              readOnly={isView}
              type="text"
              placeholder="Enter product name"
              className="bg-white"
              name="name"
              value={formData.name}
              onBlur={() => handleBlur("name")}
              onChange={handleInputChange}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="partNo" className="text-sm">
              Part No.
            </Label>
            <Input
              id="partNo"
              readOnly={isView}
              type="text"
              placeholder="Enter Part No."
              className="bg-white"
              name="partNo"
              value={formData.partNo}
              onBlur={() => handleBlur("partNo")}
              onChange={handleInputChange}
            />
            {errors.partNo && <p className="text-xs text-red-500">{errors.partNo}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="unitPrice" className="text-sm">
                Unit Price ($)
              </Label>
              <Input
                id="unitPrice"
                readOnly={isView}
                type="number"
                step="0.01"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleInputChange}
                onBlur={() => handleBlur("unitPrice")}
                placeholder="Enter Unit Price"
                className="bg-white"
              />
              {errors.unitPrice && <p className="text-xs text-red-500">{errors.unitPrice}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="unitOfMeasure" className="text-sm">
                Unit of Measure
              </Label>
              <Input
                readOnly={isView}
                id="unitOfMeasure"
                placeholder="Enter Unit of Measure"
                className="bg-white"
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleInputChange}
                onBlur={() => handleBlur("unitOfMeasure")}
                type="text"
              />
              {errors.unitOfMeasure && (
                <p className="text-xs text-red-500">{errors.unitOfMeasure}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Textarea
              readOnly={isView}
              id="description"
              placeholder="Enter text here"
              className="min-h-[120px] bg-white"
              name="description"
              value={formData.description}
              onBlur={() => handleBlur("description")}
              onChange={handleInputChange}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {!isView && (
            <div className="flex items-center gap-3">
              <Label htmlFor="inStock" className="text-sm">
                In Stock
              </Label>
              <Switch
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
              />
              <span className="text-sm text-gray-600">
                {formData.inStock ? 'Yes' : 'No'}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          {!isView && (
            <React.Fragment>
              <Button
                onClick={() => navigate("/products")}
                type="button"
                variant="outline"
                className="bg-white hover:bg-white/80"
              >
                Cancel
              </Button>
              <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
            </React.Fragment>
          )}
          {isView && (
            <Button onClick={() => navigate("/products")} type="button">
              Back
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
