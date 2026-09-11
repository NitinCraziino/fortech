// src/redux/slices/authSlice.ts
import { deleteApi, getApi, postApi, putApi } from "@/api/api";
import { CREATEORDER, GETORDER, GETALLORDERS, GETUSERORDERS, EXPORTORDERS, FULFILLORDERS, DELETEORDER } from "@/api/apiConstants";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define an interface for your Auth state
export interface OrderState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: Array<any>;
  // Orders for a single customer, shown in the customer-orders dialog.
  // Kept separate from `orders` so it never clobbers the main Orders page state.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customerOrders: Array<any>;
  customerOrdersLoading: boolean;
  loading: boolean;
  error: string | null;
  order: null | object;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
}

// Define the initial state
const initialState: OrderState = {
  orders: [],
  customerOrders: [],
  customerOrdersLoading: false,
  loading: false,
  error: null,
  order: null,
};

// Create an async thunk to handle login
export const createOrderAsync = createAsyncThunk(
  "order/create",
  async (
    {
      products,
      userId,
      pickupLocation,
      totalPrice,
      poNumber,
      comments,
      deliveryDate,
    }: {
      products: OrderProduct[];
      userId: string;
      pickupLocation: string;
      totalPrice: string;
      poNumber: string;
      comments: string;
      deliveryDate: Date;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await postApi(
        CREATEORDER,
        { products, userId, pickupLocation, totalPrice, poNumber, comments, deliveryDate },
        {},
        false
      );

      // Assuming the response contains user data and token
      return {
        order: response.order,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log("🚀 ~ error:", error);

      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Create order failed. Please try again.");
    }
  }
);

export const getOrdersAsync = createAsyncThunk(
  "order/get",
  // eslint-disable-next-line no-empty-pattern, @typescript-eslint/no-explicit-any
  async ({ userId }: { userId: string; }, { rejectWithValue }) => {
    try {
      const response = await getApi(GETUSERORDERS.replace(":userId", userId), {}, {}, false);
      console.log("🚀 ~ response:", response);

      // Assuming the response contains user data and token
      return {
        orders: response.orders,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message;
      console.log("🚀 ~ error:", error.response.data.message);
      // Return error in case of failure
      return rejectWithValue(message ? message : "Error getting orders. Please try again.");
    }
  }
);

// Fetch all orders for a single customer (used by the customer-orders dialog
// on the customer listing page). Reuses the existing per-user orders endpoint
// but stores the result in `customerOrders` so it doesn't affect the Orders page.
export const getCustomerOrdersAsync = createAsyncThunk(
  "order/getCustomerOrders",
  async ({ customerId }: { customerId: string }, { rejectWithValue }) => {
    try {
      const response = await getApi(GETUSERORDERS.replace(":userId", customerId), {}, {}, false);
      return {
        orders: response.orders,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message;
      return rejectWithValue(message ? message : "Error getting customer orders. Please try again.");
    }
  }
);

export const fulFillOrdersAsync = createAsyncThunk(
  "order/fullfill",
  async ({ orderIds }: { orderIds: string[]; }, { rejectWithValue }) => {
    try {
      const response = await putApi(FULFILLORDERS, { orderIds }, {}, false);
      console.log("🚀 ~ response:", response);

      return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message;
      console.log("🚀 ~ error:", message);
      return rejectWithValue(message ? message : "Error fulfilling orders. Please try again.");
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "order/delete",
  async ({ orderId }: { orderId: string; }, { rejectWithValue }) => {
    try {
      const response = await deleteApi(DELETEORDER.replace(":orderId", orderId), {}, {}, false);

      console.log("🚀 ~ response:", response);

      return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message;
      console.log("🚀 ~ error:", message);
      return rejectWithValue(message ? message : "Error in Deleting order. Please try again.");
    }
  }
);

export const getOrderById = createAsyncThunk(
  "order/getById",
  async ({ _id }: { _id: string; }, { rejectWithValue }) => {
    try {
      const response = await getApi(GETORDER.replace(":id", _id), {}, {}, false);

      // Assuming the response contains user data and token
      return {
        order: response.order,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Error getting order. Please try again.");
    }
  }
);

export const getAllOrders = createAsyncThunk(
  "order/getAll",
  async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any,
    { rejectWithValue }
  ) => {
    try {
      const response = await getApi(GETALLORDERS, {}, {}, false);

      // Assuming the response contains user data and token
      return {
        orders: response.orders,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Error getting orders. Please try again.");
    }
  }
);

export const exportOrderAsync = createAsyncThunk(
  "order/export",
  async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { orderIds }: { orderIds: string[]; },
    { rejectWithValue }
  ) => {
    try {
      const response = await postApi(EXPORTORDERS, { orderIds }, {}, false);

      // Assuming the response contains user data and token
      window.open(response.fileUrl, "_blank");
      return {
        fileUrl: response.fileUrl,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message; // Return error in case of failure
      return rejectWithValue(message ? message : "Error getting orders. Please try again.");
    }
  }
);

// Create the auth slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // Reset the customer-orders dialog state when it closes so stale orders
    // from a previously viewed customer don't flash on the next open.
    clearCustomerOrders: (state) => {
      state.customerOrders = [];
      state.customerOrdersLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(createOrderAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.orders.push(action.payload.order);
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(exportOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      .addCase(exportOrderAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
      })
      .addCase(exportOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getAllOrders.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.orders = action.payload.orders;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getOrdersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getOrdersAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.orders = action.payload.orders;
      })
      .addCase(getOrdersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getCustomerOrdersAsync.pending, (state) => {
        state.customerOrdersLoading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getCustomerOrdersAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.customerOrdersLoading = false;
        state.customerOrders = action.payload.orders;
      })
      .addCase(getCustomerOrdersAsync.rejected, (state, action) => {
        state.customerOrdersLoading = false;
        state.customerOrders = [];
        state.error = action.payload as string;
      });

    builder
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getOrderById.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.order = action.payload.order;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCustomerOrders } = orderSlice.actions;

export default orderSlice.reducer;
