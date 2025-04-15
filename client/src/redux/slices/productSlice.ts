// src/redux/slices/authSlice.ts
import { getApi, postApi, putApi } from "@/api/api";
import {
  CREATEPRODUCT,
  GETALLPRODUCTS,
  UPDATEPRODUCTSTATUS,
  EDITPRODUCT,
  GETPRODUCTBYID,
  GETCUSTOMERPRICES,
  UPDATECUSTOMERPRICE,
  GETCUSTOMERPRODUCTS,
  BULKUPDATEPRICE,
  IMPORTCUSTOMERPRODUCTS,
  ASSIGNPRODUCTSTOCUSTOMERS,
  TOGGLEPRODUCTTAXSTATUS,
  TOGGLECUSTOMERPRODUCTTAXSTATUS,
} from "@/api/apiConstants";
import { BulkAssignPayload } from "@/types/product";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Product {
  name: string,
  _id: string;
  partNo: string;
  unitPrice: number;
  unitOfMeasure: string;
  description: string;
  active: boolean;
  image: string;
}

interface CustomerPrices extends Product {
  customerPrice: number;
  customerPriceId: string;
}

// Define an interface for your Auth state
export interface ProductState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: Array<any>;
  loading: boolean;
  error: string | null;
  product: null | object;
  orderProducts: Array<Product>;
  customerPrices: Array<CustomerPrices>;
}

// Define the initial state
const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  product: null,
  orderProducts: [],
  customerPrices: [],
};

// Create an async thunk to handle login
export const createProductAsync = createAsyncThunk(
  "product/create",
  async (
    {
      name,
      partNo,
      description,
      unit,
      unitPrice,
      image,
    }: { name: string; partNo: string; description: string; unit: string; unitPrice: string; image: File | null; },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("partNo", partNo);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("unit", unit);
      formData.append("unitPrice", unitPrice);
      if (image) {
        formData.append("image", image);
      }
      const response = await postApi(CREATEPRODUCT, formData, {}, true);

      // Assuming the response contains user data and token
      return {
        product: response.product,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Invite failed. Please try again.");
    }
  }
);

export const getProductsAsync = createAsyncThunk(
  "product/get",
  // eslint-disable-next-line no-empty-pattern, @typescript-eslint/no-explicit-any
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getApi(GETALLPRODUCTS, {}, {}, false);
      // Assuming the response contains user data and token
      return {
        products: response.products,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message;
      // Return error in case of failure
      return rejectWithValue(message ? message : "Error getting products. Please try again.");
    }
  }
);

export const getCustomerProductsAsync = createAsyncThunk(
  "product/getCustomerProducts",
  // eslint-disable-next-line no-empty-pattern, @typescript-eslint/no-explicit-any
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getApi(GETCUSTOMERPRODUCTS, {}, {}, false);
      // Assuming the response contains user data and token
      return {
        products: response.products,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message;
      // Return error in case of failure
      return rejectWithValue(message ? message : "Error getting products. Please try again.");
    }
  }
);

export const getCustomerPricesAsync = createAsyncThunk(
  "product/getCustomerPrices",
  // eslint-disable-next-line no-empty-pattern, @typescript-eslint/no-explicit-any
  async ({ userId }: { userId: string; }, { rejectWithValue }) => {
    try {
      const response = await postApi(GETCUSTOMERPRICES, { userId }, {}, false);
      // Assuming the response contains user data and token
      return {
        products: response.products,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message;
      // Return error in case of failure
      return rejectWithValue(message ? message : "Error getting products. Please try again.");
    }
  }
);

export const toggleCustomerProductTaxStatus = createAsyncThunk(
  "user/toggleTaxStatus",
  async ({ productId, taxEnabled, customerId }: { productId: string; taxEnabled: boolean; customerId: string; }, { rejectWithValue }) => {
    try {
      const response = await putApi(TOGGLECUSTOMERPRODUCTTAXSTATUS, { productId, taxEnabled, customerId }, {}, false);
      return response;
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Invite failed. Please try again.");
    }
  }
);

export const toggleProductTaxStatus = createAsyncThunk(
  "product/toggleTaxStatus",
  async ({ productId, taxEnabled }: { productId: string; taxEnabled: boolean; }, { rejectWithValue }) => {
    try {
      const response = await putApi(TOGGLEPRODUCTTAXSTATUS, { productId, taxEnabled }, {}, false);
      return response;
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Invite failed. Please try again.");
    }
  }
);

export const getProductById = createAsyncThunk(
  "product/getById",
  async ({ _id }: { _id: string; }, { rejectWithValue }) => {
    try {
      const response = await getApi(GETPRODUCTBYID.replace(":id", _id), {}, {}, false);

      // Assuming the response contains user data and token
      return {
        product: response.product,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Invite failed. Please try again.");
    }
  }
);

export const editProductAsync = createAsyncThunk(
  "product/edit",
  async (
    {
      _id,
      partNo,
      description,
      unit,
      unitPrice,
      image,
      name,
    }: {
      _id: string;
      partNo: string;
      description: string;
      unit: string;
      unitPrice: string;
      image: File | null;
      name: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("partNo", partNo);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("unit", unit);
      formData.append("unitPrice", unitPrice);
      if (image) {
        formData.append("image", image);
      }
      formData.append("_id", _id);

      const response = await postApi(EDITPRODUCT, formData, {}, true);

      // Assuming the response contains user data and token
      return {
        product: response.product,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Invite failed. Please try again.");
    }
  }
);

export const bulkPriceUpdate = createAsyncThunk(
  "product/BulkUpdate",
  async (
    {
      file
    }: {
      file: File;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("prices", file);
      await postApi(BULKUPDATEPRICE, formData, {}, true);
      // Assuming the response contains user data and token
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Bulk update failed. Please try again.");
    }
  }
);

export const importCustomerProducts = createAsyncThunk(
  "product/importCustomerProducts",
  async (
    {
      file,
      customerId
    }: {
      file: File;
      customerId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("customerId", customerId);
      formData.append("products", file);
      await postApi(IMPORTCUSTOMERPRODUCTS, formData, {}, true);
      // Assuming the response contains user data and token
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Bulk update failed. Please try again.");
    }
  }
);

export const updateProductStatusAsync = createAsyncThunk(
  "product/update",
  async ({ productId, active }: { productId: string; active: boolean; }, { rejectWithValue }) => {
    try {
      const response = await postApi(UPDATEPRODUCTSTATUS, { productId, active }, {}, false);

      // Assuming the response contains user data and token
      return {
        product: response.product,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Invite failed. Please try again.");
    }
  }
);


export const updateCustomerPriceAsync = createAsyncThunk(
  "product/updateCustomerPrice",
  async ({ productId, customerId, price }: { productId: string; customerId: string; price: number; }, { rejectWithValue }) => {
    try {
      const response = await postApi(UPDATECUSTOMERPRICE, { productId, customerId, price }, {}, false);

      // Assuming the response contains user data and token
      return {
        customerPrice: response.customerPrice,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Update failed. Please try again.");
    }
  }
);



export const assignProductsToCustomersAsync = createAsyncThunk(
  "product/assignProductsToCustomers",
  async (payload: BulkAssignPayload) => {
    const response = await postApi(ASSIGNPRODUCTSTOCUSTOMERS, payload, {}, false);
    return response;
  }
);

// Create the auth slice
const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    selectOrderProducts(state, action: PayloadAction<Product[]>) {
      state.orderProducts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(createProductAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.products.push(action.payload.product);
      })
      .addCase(createProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(bulkPriceUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      .addCase(bulkPriceUpdate.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
      })
      .addCase(bulkPriceUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(importCustomerProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      .addCase(importCustomerProducts.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
      })
      .addCase(importCustomerProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getProductsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getProductsAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.products = action.payload.products;
      })
      .addCase(getProductsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getCustomerProductsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getCustomerProductsAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.products = action.payload.products;
      })
      .addCase(getCustomerProductsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(toggleProductTaxStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleProductTaxStatus.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(toggleProductTaxStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(toggleCustomerProductTaxStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleCustomerProductTaxStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(toggleCustomerProductTaxStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message as string;
      });

    builder
      .addCase(getCustomerPricesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getCustomerPricesAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.customerPrices = action.payload.products;
      })
      .addCase(getCustomerPricesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateCustomerPriceAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      .addCase(updateCustomerPriceAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
      })
      .addCase(updateCustomerPriceAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getProductById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.product = action.payload.product;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(editProductAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      .addCase(editProductAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
      })
      .addCase(editProductAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateProductStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(updateProductStatusAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const index = state.products.findIndex(
          (product) => product._id === action.payload.product._id
        );
        if (index !== -1) {
          // If the product exists, update it with the new data
          state.products[index] = action.payload.product;
        } else {
          // If the product does not exist, you can optionally append it (or handle as needed)
          state.products = [...state.products, action.payload.product];
        }
      })
      .addCase(updateProductStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(assignProductsToCustomersAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignProductsToCustomersAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(assignProductsToCustomersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectOrderProducts } = productSlice.actions;

export default productSlice.reducer;
