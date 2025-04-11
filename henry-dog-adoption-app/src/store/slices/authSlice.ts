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

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.name = "";
      state.email = "";
      state.isLoggedIn = false;
      state.error = null;
      // Clear auth data from localStorage
      localStorage.removeItem("auth");
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
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
