import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { clearFavorite, clearBreeds } from "./dogsSlice";
import { resetFilter } from "./filtersSlice";
import { apiClient } from "@/lib/apiClient";

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

interface AuthState {
  user: {
    _id: string;
    userName: string;
    email: string;
  } | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const loadAuthFromStorage = (): Partial<AuthState> => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const storedAuth = localStorage.getItem("dogAuth");
    if (storedAuth) {
      return JSON.parse(storedAuth);
    }
  } catch (error) {
    console.error("Failed to load auth from localStorage:", error);
  }

  return {};
};

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
  ...loadAuthFromStorage(),
};

const saveAuthToStorage = (auth: Partial<AuthState>) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        "dogAuth",
        JSON.stringify({
          user: auth.user,
          isLoggedIn: auth.isLoggedIn,
        })
      );
    } catch (error) {
      console.error("Failed to save auth to localStorage:", error);
    }
  }
};

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/auth/check", { withCredentials: true });
      if (res.status === 200 && res.data.user) {
        return {
          isLoggedIn: true,
          user: res.data.user,
        };
      }
      return { isLoggedIn: false, user: null };
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Authentication check failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  }
);

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
    } catch (error: unknown) {
      console.error("Logout thunk: Error during logout:", {
        status: error instanceof AxiosError ? error.response?.status : null,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during logout.",
      });

      // Even if the API call fails, clear local state
      dispatch(clearFavorite());
      dispatch(clearBreeds());
      dispatch(resetFilter());
      localStorage.clear();

      // Remove logout flag
      sessionStorage.removeItem("logging_out");

      return rejectWithValue(
        error instanceof AxiosError
          ? error.response?.data?.message || "An error occurred during logout."
          : "An error occurred during logout."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem("dogAuth");
    },
    resetAuth() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        saveAuthToStorage(state);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to login";
        state.isLoggedIn = false;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn;
        state.user = action.payload.user;
        if (action.payload.isLoggedIn) {
          saveAuthToStorage(state);
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoggedIn = false;
        state.user = null;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, () => {
        return initialState;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Logout failed";
      });
  },
});

export const { resetAuth, logout } = authSlice.actions;
export default authSlice.reducer;
