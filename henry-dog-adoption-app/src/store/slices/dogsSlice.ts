import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Dog } from "@/types/dog";
import { RootState } from "..";
import { apiClient } from "@/lib/apiClient";

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
  async (_, { getState, rejectWithValue }) => {
    // Get the full state
    const state = getState() as RootState;
    const filters = state.filters;
    const currentPage = state.dogs.page;

    // *** Get sort value from filters state ***
    const currentSort = filters.sort; // e.g., "breed:asc"

    try {
      console.log(
        `fetchDogs Thunk: Fetching page ${currentPage} with sort: ${currentSort}`
      );

      // Call *your* Next.js API route
      const searchResponse = await apiClient.get("/dogs/search", {
        params: {
          breeds: filters.breeds.length ? filters.breeds : undefined,
          zipCodes: filters.zipCodes.length ? filters.zipCodes : undefined,
          ageMin: filters.ageMin ?? undefined, // Use nullish coalescing
          ageMax: filters.ageMax ?? undefined,
          size: filters.size,
          from: currentPage * filters.size,
          sort: currentSort, // *** Pass sort parameter ***
        },
      });

      console.log(
        "fetchDogs Thunk: Search response status:",
        searchResponse.status
      );
      const resultIds = searchResponse.data?.resultIds || [];
      const total = searchResponse.data?.total || 0;

      if (resultIds.length === 0) {
        console.log("fetchDogs Thunk: No result IDs found.");
        return {
          resultIds: [],
          dogs: [],
          total: 0,
          size: filters.size,
        };
      }

      console.log(
        `fetchDogs Thunk: Found ${resultIds.length} IDs, fetching details.`
      );
      // Fetch details using your Next.js API route
      const dogsResponse = await apiClient.post("/dogs", resultIds);
      console.log(
        "fetchDogs Thunk: Dog details response status:",
        dogsResponse.status
      );

      return {
        resultIds,
        dogs: dogsResponse.data || [],
        total,
        size: filters.size,
      };
    } catch (error: any) {
      console.error("fetchDogs Thunk: Error occurred:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      // Handle specific errors or provide generic message
      if (error.response?.status === 401) {
        // Optional: Redirect or specific handling for auth errors
        console.error("fetchDogs Thunk: Authentication error (401).");
        // window.location.href = "/"; // Example redirect
        return rejectWithValue("Authentication failed. Please log in again.");
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch dogs"
      );
    }
  }
);

export const fetchFavoriteDogs = createAsyncThunk(
  "dogs/fetchFavoriteDogs",
  async (favoriteIds: string[], { rejectWithValue }) => {
    try {
      if (favoriteIds.length === 0) {
        return { dogs: [] };
      }
      console.log(
        `fetchFavoriteDogs Thunk: Fetching ${favoriteIds.length} favorites.`
      );
      // Call your /api/dogs route
      const response = await apiClient.post("/dogs", favoriteIds);
      console.log("fetchFavoriteDogs Thunk: Received details.");
      return { dogs: response.data || [] };
    } catch (error: any) {
      console.error("fetchFavoriteDogs Thunk: Error:", {
        /* ... */
      });
      if (error.response?.status === 401) {
        return rejectWithValue("Authentication failed.");
      }
      return rejectWithValue(error.message || "Failed to fetch favorite dogs");
    }
  }
);

export const fetchMatch = createAsyncThunk(
  "dogs/fetchMatch",
  async (favoriteIds: string[], { rejectWithValue }) => {
    try {
      console.log(
        `fetchMatch Thunk: Fetching match for ${favoriteIds.length} favorites.`
      );
      // Call your /api/dogs/match route
      const response = await apiClient.post("/dogs/match", { favoriteIds });
      console.log("fetchMatch Thunk: Received match response.");
      // Check response structure based on your /api/dogs/match implementation
      if (response.data && response.data.id) {
        return response.data;
      } else {
        console.error(
          "fetchMatch Thunk: Invalid match data received.",
          response.data
        );
        return rejectWithValue("Invalid match data received.");
      }
    } catch (error: any) {
      console.error("fetchMatch Thunk: Error:", {
        /* ... */
      });
      if (error.response?.status === 401) {
        return rejectWithValue("Authentication failed.");
      }
      return rejectWithValue(error.message || "Failed to fetch match");
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
