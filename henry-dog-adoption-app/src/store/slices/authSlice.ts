import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/apiClient";
import axios from "axios";
import { clearFavorite, clearBreeds } from "./dogsSlice";
import { resetFilter } from "./filtersSlice";
import { RootState } from "..";

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
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/loginUser", async ({ name, email }, { rejectWithValue }) => {
  try {
    console.log("Login thunk: Attempting login for:", { name, email });

    // Use axios directly with the correct Next.js API route
    const res = await axios.post(
      "/api/auth/login",
      { name, email },
      { withCredentials: true } // Ensure cookies are properly saved
    );

    if (res.status === 200) {
      console.log("Login thunk: Login successful");
      return { name, email };
    } else {
      console.error("Login thunk: Login failed with status:", res.status);
      return rejectWithValue("Login failed with status: " + res.status);
    }
  } catch (error: any) {
    console.error("Login thunk: Error during login:", {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    return rejectWithValue(
      error.response?.data?.message || "An error occurred during login."
    );
  }
});

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log("Logout thunk: Attempting logout");

      // Flag the logout in sessionStorage to prevent unnecessary API calls during logout
      sessionStorage.setItem("logging_out", "true");

      // Use axios directly with the correct Next.js API route
      await axios.post("/api/auth/logout", {}, { withCredentials: true });

      console.log("Logout thunk: Logout API call successful");

      // Clear all user data
      dispatch(clearFavorite());
      dispatch(clearBreeds());
      dispatch(resetFilter());
      localStorage.clear(); // Clear all localStorage data

      // Add a small delay before removing the logging_out flag
      // This gives time for any in-flight requests to complete
      setTimeout(() => {
        sessionStorage.removeItem("logging_out");
      }, 500);

      return true;
    } catch (error: any) {
      console.error("Logout thunk: Error during logout:", {
        status: error.response?.status,
        message: error.message,
      });

      // Even if the API call fails, clear local state
      dispatch(clearFavorite());
      dispatch(clearBreeds());
      dispatch(resetFilter());
      localStorage.clear();

      // Remove logout flag
      sessionStorage.removeItem("logging_out");

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
    login: (state, action: PayloadAction<string>) => {
      state.isLoggedIn = true;
      state.name = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.name = "";
    },
    resetAuth(state) {
      return initialState;
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
        return initialState;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Logout failed";
      });
  },
});

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectAuthName = (state: RootState) => state.auth.name;

export const { resetAuth, login, logout } = authSlice.actions;
export default authSlice.reducer;
