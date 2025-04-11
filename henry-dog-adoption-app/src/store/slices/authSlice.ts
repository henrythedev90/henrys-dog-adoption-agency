import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/apiClient";

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

// Load initial state from localStorage if available
const loadState = (): AuthState => {
  try {
    const serializedState = localStorage.getItem("auth");
    if (serializedState === null) {
      return {
        name: "",
        email: "",
        loading: false,
        error: null,
        isLoggedIn: false,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      name: "",
      email: "",
      loading: false,
      error: null,
      isLoggedIn: false,
    };
  }
};

const initialState: AuthState = loadState();

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/check");
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
      // Store auth data in localStorage
      const authData = { name, email, isLoggedIn: true };
      localStorage.setItem("auth", JSON.stringify(authData));
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
      await apiClient.post("/auth/logout", {});
      localStorage.removeItem("auth");
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
  reducers: {},
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
          // If auth check fails, clear the stored auth data
          localStorage.removeItem("auth");
          state.name = "";
          state.email = "";
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoggedIn = false;
        localStorage.removeItem("auth");
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

export default authSlice.reducer;
