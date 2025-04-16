import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../lib/apiClient";
import { Dog } from "@/types/dog";
import { RootState } from "..";
import axios from "axios";

// Load initial favorites from localStorage
const loadFavorites = (): string[] => {
  try {
    const serializedFavorites = localStorage.getItem("favorites");
    if (serializedFavorites === null) {
      return [];
    }
    return JSON.parse(serializedFavorites);
  } catch (err) {
    return [];
  }
};

interface DogState {
  resultIds: string[];
  results: Dog[];
  favorites: string[];
  match: Dog | null;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
}

const initialState: DogState = {
  resultIds: [],
  results: [],
  favorites: loadFavorites(),
  match: null,
  loading: false,
  error: null,
  page: 0,
  totalPages: 1,
};

export const fetchDogs = createAsyncThunk(
  "dogs/fetchDogs",
  async (_, { getState }) => {
    const state = getState() as { filters: any; dogs: DogState };
    const filters = state.filters;
    const currentPage = state.dogs.page;
    try {
      // First, get the search results with IDs
      const searchResponse = await apiClient.get("/dogs/search", {
        params: {
          breeds: filters.breeds.length ? filters.breeds : undefined,
          zipCodes: filters.zipCodes.length ? filters.zipCodes : undefined,
          ageMin: filters.ageMin || undefined,
          ageMax: filters.ageMax || undefined,
          size: filters.size,
          from: currentPage * filters.size,
          sort: "breed:asc",
        },
        withCredentials: true,
      });

      const resultIds = searchResponse.data.resultIds || [];
      const total = searchResponse.data.total || 0;

      // Then, fetch the actual dog data using the IDs
      if (resultIds.length > 0) {
        const dogsResponse = await apiClient.post("/dogs", resultIds, {
          withCredentials: true,
        });
        return {
          resultIds,
          dogs: dogsResponse.data || [],
          total,
          size: filters.size,
        };
      }

      return {
        resultIds: [],
        dogs: [],
        total: 0,
        size: filters.size,
      };
    } catch (error: any) {
      throw error;
    }
  }
);

export const fetchFavoriteDogs = createAsyncThunk(
  "dogs/fetchFavoriteDogs",
  async (favoriteIds: string[]) => {
    try {
      if (favoriteIds.length === 0) {
        return { dogs: [] };
      }

      const response = await apiClient.post("/dogs", favoriteIds, {
        withCredentials: true,
      });

      return { dogs: response.data || [] };
    } catch (error: any) {
      throw error;
    }
  }
);

export const fetchMatch = createAsyncThunk(
  "dogs/fetchMatch",
  async (favoriteIds: string[], { rejectWithValue }) => {
    // Note: No isLoggedIn check here, assuming auth is handled by the API route
    try {
      console.log(
        "fetchMatch Thunk: Calling /api/dogs/match with favorites:",
        favoriteIds
      );
      // *** Use axios to call YOUR Next.js API route ***
      const response = await axios.post(
        "/api/dogs/match", // Target your API route
        { favoriteIds },
        {
          withCredentials: true, // Send cookies to your API route
        }
      );

      console.log("fetchMatch Thunk: Received response from /api/dogs/match:", {
        status: response.status,
        data: response.data,
      });

      // Your /api/dogs/match route should return the dog object directly
      if (response.data && response.data.id) {
        return response.data; // Return the dog object
      } else {
        console.error(
          "fetchMatch Thunk: API response from /api/dogs/match did not contain valid dog data.",
          response.data
        );
        return rejectWithValue("Received invalid data for matched dog.");
      }
    } catch (error: any) {
      console.error("fetchMatch Thunk: Error calling /api/dogs/match:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      // Provide a user-friendly error message
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate match. Please try again."
      );
    }
  }
);

const dogsSlice = createSlice({
  name: "dogs",
  initialState,
  reducers: {
    setResults: (state, action: PayloadAction<Dog[]>) => {
      state.results = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const dogId = action.payload;
      if (state.favorites.includes(dogId)) {
        state.favorites = state.favorites.filter((id) => id !== dogId);
      } else {
        state.favorites.push(dogId);
      }
      // Persist favorites to localStorage
      localStorage.setItem("favorites", JSON.stringify(state.favorites));
    },
    setMatch: (state, action: PayloadAction<Dog>) => {
      state.match = action.payload;
    },
    clearFavorite: (state) => {
      state.favorites = [];
      localStorage.removeItem("favorites");
    },
    clearBreeds: (state) => {
      state.results = [];
      state.resultIds = [];
      state.totalPages = 1;
      state.page = 0;
    },
    setDogsPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDogs.fulfilled, (state, action) => {
        state.loading = false;
        state.resultIds = action.payload.resultIds;
        state.results = action.payload.dogs;
        state.totalPages = Math.ceil(
          action.payload.total / action.payload.size
        );
      })
      .addCase(fetchDogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch dogs";
      })
      .addCase(fetchFavoriteDogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteDogs.fulfilled, (state, action) => {
        state.loading = false;
        // Add favorite dogs to the results without replacing existing dogs
        const newDogs = action.payload.dogs.filter(
          (dog: Dog) =>
            !state.results.some((existingDog) => existingDog.id === dog.id)
        );
        state.results = [...state.results, ...newDogs];
      })
      .addCase(fetchFavoriteDogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch favorite dogs";
      })
      .addCase(fetchMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatch.fulfilled, (state, action: PayloadAction<Dog>) => {
        // *** Added Logging ***
        console.log(
          "fetchMatch Reducer (Fulfilled): Received payload:",
          action.payload
        );

        // Ensure payload is a valid Dog object before setting
        if (
          action.payload &&
          typeof action.payload === "object" &&
          action.payload.id
        ) {
          state.loading = false;
          state.match = action.payload; // Expecting the dog object directly
          state.error = null; // Clear any previous error
        } else {
          console.error(
            "fetchMatch Reducer (Fulfilled): Invalid payload received, not updating state:",
            action.payload
          );
          state.loading = false;
          state.error = "Received invalid data for match."; // Set an error state
        }
      })
      .addCase(fetchMatch.rejected, (state, action) => {
        console.log("fetchMatch Reducer (Rejected): Action:", action);
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch match";
        state.match = null; // Clear any potentially stale match
      });
  },
});

export const {
  setResults,
  toggleFavorite,
  setMatch,
  clearFavorite,
  clearBreeds,
  setDogsPage,
} = dogsSlice.actions;

export default dogsSlice.reducer;
