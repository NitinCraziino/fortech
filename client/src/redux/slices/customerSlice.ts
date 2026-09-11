// src/redux/slices/authSlice.ts
import { getApi, patchApi, postApi, putApi } from "@/api/api";
import { INVITECUSTOMER, GETCUSTOMERS, DELETECUSTOMERPRODUCTS, GETCUSTOMER, UPDATECUSTOMERNAMEANDEMAIL, UPDATECUSTOMERTAX } from "@/api/apiConstants";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define an interface for your Auth state
export interface AuthState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customers: Array<any>;
  loading: boolean;
  error: string | null;
  customer: null | object;
}

// Define the initial state
const initialState: AuthState = {
  customers: [],
  loading: false,
  error: null,
  customer: null,
};

// Create an async thunk to handle login
export const inviteCustomerAsync = createAsyncThunk(
  "user/invite",
  async ({ email, customerName, products, customerId }: { email: string; customerName: string, products: File | null, customerId?: string; }, { rejectWithValue }) => {
    console.log("🚀 ~ products:", products)
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("customerName", customerName);
      if(products) {
        formData.append("products", products);
      }
      if (customerId) {
        formData.append("customerId", customerId);
      }
      const response = await postApi(INVITECUSTOMER, formData, {}, true);
      // Assuming the response contains user data and token
      return {
        customer: response.customer,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message
      console.log("🚀 ~ error:", error.response.data.message)
      // Return error in case of failure
      return rejectWithValue(message ? message : "Invite failed. Please try again.");
    }
  }
);

export const updateCustomerNameAndEmailAsync = createAsyncThunk(
  "user/updateName",
  async ({ customerId, newName, newEmail }: { customerId: string, newName: string; newEmail: string; }, { rejectWithValue }) => {
    try {
      const response = await patchApi(UPDATECUSTOMERNAMEANDEMAIL.replace(':id', customerId), { newName, newEmail }, {}, false);

      return response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message;
      console.log("🚀 ~ error:", error.response.data.message);
      return rejectWithValue(message ? message : "Error updaitn customer name. Please try again.");
    }
  }
)

// Update the customer-level tax setting (enable/disable + the tax rate %).
export const updateCustomerTaxAsync = createAsyncThunk(
  "customer/updateCustomerTax",
  async (
    { customerId, taxEnabled, taxAmount }: { customerId: string; taxEnabled: boolean; taxAmount: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await putApi(UPDATECUSTOMERTAX, { customerId, taxEnabled, taxAmount }, {}, false);

      return response.customer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message
      console.log("🚀 ~ error:", error.response.data.message)
      // Return error in case of failure
      return rejectWithValue(message ? message : "Error updating customer tax. Please try again.");
    }

  }
);

export const getCustomerAsync = createAsyncThunk(
  "user/getCustomer",
  async ({ customerId }: { customerId: string }, { rejectWithValue }) => {
    try {
      const response = await getApi(GETCUSTOMER.replace(":id", customerId), {}, {}, false);
      // Assuming the response contains user data and token
      return {
        customer: response.customer,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message
      console.log("🚀 ~ error:", error.response.data.message)
      // Return error in case of failure
      return rejectWithValue(message ? message : "Error getting customer. Please try again.");
    }
  }
);

export const getCustomersAsync = createAsyncThunk(
    "user/get",
    // eslint-disable-next-line no-empty-pattern, @typescript-eslint/no-explicit-any
    async (params: any, { rejectWithValue }) => {
      try {
        const response = await getApi(GETCUSTOMERS, {}, {}, false);
        console.log("🚀 ~ response:", response)
  
        // Assuming the response contains user data and token
        return {
          customers: response.customers,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const message = error?.response?.data.message
        console.log("🚀 ~ error:", error.response.data.message)
        // Return error in case of failure
        return rejectWithValue(message ? message : "Error getting customers. Please try again.");
      }
    }
  );

  export const deleteProductsAsync = createAsyncThunk(
    "product/deleteProducts",
    async ({ productIds, userId }: { productIds: string[]; userId: string }, { rejectWithValue }) => {
      try {
         await postApi(DELETECUSTOMERPRODUCTS, { productIds, userId }, {}, false);
  
        // Assuming the response contains user data and token
        return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const message = error?.response?.data.message; // Return error in case of failure
        return rejectWithValue(message ? message : "Delete failed. Please try again.");
      }
    }
  );

// Create the auth slice
const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(inviteCustomerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(inviteCustomerAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.customers.push(action.payload.customer) 
      })
      .addCase(inviteCustomerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getCustomersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getCustomersAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.customers = action.payload.customers;
      })
      .addCase(getCustomersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      builder
      .addCase(getCustomerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getCustomerAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.customer = action.payload.customer;
      })
      .addCase(getCustomerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      builder
      .addCase(updateCustomerTaxAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.customer = action.payload;
      })
      builder
      .addCase(updateCustomerTaxAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerTaxAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateCustomerNameAndEmailAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      });
    builder
      .addCase(updateCustomerNameAndEmailAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerNameAndEmailAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      builder
      .addCase(deleteProductsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      .addCase(deleteProductsAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
      })
      .addCase(deleteProductsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});


export default customerSlice.reducer;
