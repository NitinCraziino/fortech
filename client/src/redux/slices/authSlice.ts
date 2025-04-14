// src/redux/slices/authSlice.ts
import { postApi } from "@/api/api";
import { FORGOTPASSWORD, LOGIN, RESETPASSWORD, SETPASSWORD } from "@/api/apiConstants";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Define an interface for your Auth state
export interface AuthState {
  isAuthenticated: boolean;
  user: object | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Create an async thunk to handle login
export const loginAsync = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await postApi(LOGIN, { email, password }, {}, false);

      // Assuming the response contains user data and token
      localStorage.setItem("token", response.token);
      return {
        user: response.user,
        token: response.token,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.message
      console.log("🚀 ~ error:", error.message)
      // Return error in case of failure
      return rejectWithValue(message ? message : "Login failed. Please try again.");
    }
  }
);

export const setPasswordAsync = createAsyncThunk(
  "auth/setPassword",
  async ({ userId, password }: { userId: string; password: string }, { rejectWithValue }) => {
    try {
       await postApi(SETPASSWORD, { userId, password }, {}, false);

      // Assuming the response contains user data and token
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message
      console.log("🚀 ~ error:", error.response.data.message)
      // Return error in case of failure
      return rejectWithValue(message ? message : "Set password failed. Please try again.");
    }
  }
);

export const resetPasswordAsync = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPassword }: { token: string; newPassword: string }, { rejectWithValue }) => {
    try {
       await postApi(RESETPASSWORD, { token, newPassword }, {}, false);

      // Assuming the response contains user data and token
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message
      console.log("🚀 ~ error:", error.response.data.message)
      // Return error in case of failure
      return rejectWithValue(message ? message : "Set password failed. Please try again.");
    }
  }
);

export const forgotPasswordAsync = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
       await postApi(FORGOTPASSWORD, { email }, {}, false);

      // Assuming the response contains user data and token
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error?.response?.data.message
      console.log("🚀 ~ error:", error.response.data.message)
      // Return error in case of failure
      return rejectWithValue(message ? message : "Set password failed. Please try again.");
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(loginAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      builder
      .addCase(setPasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      .addCase(setPasswordAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
      })
      .addCase(setPasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      builder
      .addCase(resetPasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      .addCase(resetPasswordAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
      })
      .addCase(resetPasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      builder
      .addCase(forgotPasswordAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      .addCase(forgotPasswordAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
      })
      .addCase(forgotPasswordAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
