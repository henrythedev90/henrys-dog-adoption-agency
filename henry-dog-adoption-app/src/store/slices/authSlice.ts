import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/apiClient";
import axios from "axios";

export interface LoginRequest {
  name: string;
  email: string;
}

export interface LoginResponse {
  name: string;
  email: string;
}

interface AuthState {
  name: string;
  email: string;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  name: "",
  email: "",
  loading: false,
  error: null,
  isLoggedIn: false,
};

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/auth/check", { withCredentials: true });
      return res.status === 200;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Authentication check failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk<
  LoginRequest,
  LoginResponse,
  { rejectValue: string }
>("auth/loginUser", async ({ name, email }, { rejectWithValue }) => {
  try {
    const res = await apiClient.post("/auth/login", { name, email });
    if (res.status === 200) {
      return { name, email };
    } else {
      return rejectWithValue("Login failed.");
    }
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "An error occurred during login."
    );
  }
});

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post("/auth/logout");
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "An error occurred during logout."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loggedIn: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      state.email = action.payload;
      state.isLoggedIn = true;
    },
    resetAuth(state) {
      state.name = "";
      state.email = "";
      state.isLoggedIn = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ name: string; email: string }>) => {
          state.name = action.payload.name;
          state.email = action.payload.email;
          state.isLoggedIn = true;
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.isLoggedIn = false;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload;
        if (!action.payload) {
          state.name = "";
          state.email = "";
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoggedIn = false;
        state.name = "";
        state.email = "";
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.name = "";
        state.email = "";
        state.isLoggedIn = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const { resetAuth, loggedIn } = authSlice.actions;
export default authSlice.reducer;
