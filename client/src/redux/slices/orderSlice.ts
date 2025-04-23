// src/redux/slices/authSlice.ts
import { getApi, postApi } from "@/api/api";
import { CREATEORDER, GETORDER, GETALLORDERS, GETUSERORDERS, EXPORTORDERS } from "@/api/apiConstants";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define an interface for your Auth state
export interface OrderState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: Array<any>;
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

export const fulFillOrdersAsync = createAsyncThunk(
  "order/fullfill",
  async ({ orderIds }: { orderIds: string[]; }) => {
    console.log(orderIds);

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
  reducers: {},
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

export default orderSlice.reducer;
