import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Dog } from "@/types/dog";
import { RootState } from "..";
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from "axios";

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
  favorites: [],
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
    const favorites = state.dogs.favorites;

    // *** Get sort value from filters state ***
    const currentSort = filters.sort; // e.g., "breed:asc"

    try {
      console.log(
        `fetchDogs Thunk: Fetching page ${currentPage} with sort: ${currentSort}`
      );

      // Call *your* Next.js API route
      const searchResponse = await apiClient.get("/dogs/search", {
        params: {
          breeds: filters.breeds.length ? filters.breeds.join(",") : undefined,
          zipCodes: filters.zipCodes.length
            ? filters.zipCodes.join(",")
            : undefined,
          boroughs: filters.boroughs.length
            ? filters.boroughs.join(",")
            : undefined,
          genders: filters.genders?.length
            ? filters.genders.join(",")
            : undefined,
          ageMin: filters.ageMin ?? undefined,
          ageMax: filters.ageMax ?? undefined,
          size: filters.size,
          from: currentPage * filters.size,
          sort: currentSort,
        },
      });

      console.log("fetchDogs Thunk: Search response:", {
        status: searchResponse.status,
        data: searchResponse.data,
        resultIds: searchResponse.data?.resultIds,
        total: searchResponse.data?.total,
      });

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

      // Fetch details using your Next.js API route
      const dogsResponse = await apiClient.post("/dogs", resultIds);

      console.log("fetchDogs Thunk: Dogs response:", {
        status: dogsResponse.status,
        data: dogsResponse.data,
        dogsFound: dogsResponse.data?.length,
      });

      // Filter out any dogs that are in favorites
      const filteredDogs = dogsResponse.data.filter(
        (dog: Dog) => !favorites.includes(dog._id)
      );

      return {
        resultIds,
        dogs: filteredDogs,
        total,
        size: filters.size,
      };
    } catch (error) {
      console.error("fetchDogs Thunk: Error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch dogs"
      );
    }
  }
);

export const fetchFavoriteDogs = createAsyncThunk(
  "dogs/fetchFavoriteDogs",
  async (_, { rejectWithValue }) => {
    try {
      // Get the favorite IDs from the API
      const favoritesResponse = await apiClient.get("/favorites");
      const userFavorites = favoritesResponse.data.favorites || [];

      if (userFavorites.length === 0) {
        return { dogs: [], favorites: [] };
      }

      // Fetch the dog details for those favorites
      // Send the array directly, not as { dogId: ... }
      const response = await apiClient.post("/dogs", userFavorites);
      return { dogs: response.data || [], favorites: userFavorites };
    } catch (error: unknown) {
      console.error("fetchFavoriteDogs Thunk: Error:", error);
      if (error instanceof AxiosError && error.response?.status === 401) {
        return rejectWithValue("Authentication failed.");
      }
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch favorite dogs"
      );
    }
  }
);

export const addFavorite = createAsyncThunk(
  "dogs/addFavorite",
  async (dogId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/favorites/${dogId}`);
      console.log("Add favorite response:", response.data);
      return dogId;
    } catch (error) {
      console.error("Failed to add favorite:", error);
      return rejectWithValue("Failed to add favorite");
    }
  }
);

export const removeFavorite = createAsyncThunk(
  "dogs/removeFavorite",
  async (dogId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/favorites/${dogId}`);
      console.log("Remove favorite response:", response.data);
      return dogId;
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      return rejectWithValue("Failed to remove favorite");
    }
  }
);

export const fetchMatch = createAsyncThunk(
  "dogs/fetchMatch",
  async (
    { favoriteIds, userId }: { favoriteIds: string[]; userId?: string },
    { rejectWithValue }
  ) => {
    try {
      console.log(
        `fetchMatch Thunk: Calling /api/dogs/match for ${favoriteIds.length} favorites.`
      );

      // Add timing for debugging
      const startTime = new Date().getTime();

      // Call your LOCAL API route with the array directly and ensure credentials are sent
      const response = await apiClient.post(
        "/dogs/match", // Target your Next.js route
        { favoriteIds, userId }, // Send both favoriteIds and userId
        {
          withCredentials: true, // Ensure cookies are sent with the request
        }
      );

      const endTime = new Date().getTime();
      console.log(`fetchMatch Thunk: Request took ${endTime - startTime}ms`);

      console.log("fetchMatch Thunk: Received response from /api/dogs/match:", {
        status: response.status,
        data: response.data
          ? typeof response.data === "object"
            ? "Valid object"
            : typeof response.data
          : "No data",
        headers: response.headers ? "Present" : "None",
      });

      // Handle the case when all dogs have been matched
      if (response.data && "allMatched" in response.data) {
        console.log("fetchMatch Thunk: All dogs have been matched.");
        return response.data;
      }

      // Handle successful match response
      if (response.data && response.data._id) {
        console.log("fetchMatch Thunk: Received valid dog data.");
        return response.data; // Return the full dog object
      } else {
        // This case should be less likely now, as the API route handles errors
        console.error(
          "fetchMatch Thunk: Invalid data received from /api/dogs/match.",
          response.data
        );
        return rejectWithValue("Match API route returned invalid data.");
      }
    } catch (error: unknown) {
      // Enhanced error logging for debugging
      console.error("fetchMatch Thunk: Error calling /api/dogs/match:", {
        status: error instanceof AxiosError ? error.response?.status : null,
        statusText:
          error instanceof AxiosError ? error.response?.statusText : null,
        data: error instanceof AxiosError ? error.response?.data : null,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during match generation.",
        stack: error instanceof Error ? error.stack?.substring(0, 200) : null,
        name: error instanceof Error ? error.name : null,
        headers:
          error instanceof AxiosError
            ? JSON.stringify(error.response?.headers)
            : "None",
      });

      if (error instanceof AxiosError && error.response?.status === 401) {
        console.error(
          "fetchMatch Thunk: Authentication error (401). This could indicate missing or expired cookies."
        );

        // Check if document.cookie exists
        console.log(
          "Current cookies:",
          document.cookie
            ? "Present (but contents hidden for security)"
            : "No cookies"
        );

        return rejectWithValue(
          "Authentication failed. Please refresh the page or log in again."
        );
      }

      // Use the error message from your API route if available
      return rejectWithValue(
        error instanceof AxiosError
          ? error.response?.data?.message ||
              error.message ||
              "Failed to generate match."
          : "Failed to generate match."
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
            !state.results.some((existingDog) => existingDog._id === dog._id)
        );
        state.results = [...state.results, ...newDogs];
        state.favorites = action.payload.favorites;
      })
      .addCase(fetchFavoriteDogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch favorite dogs";
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        if (!state.favorites.includes(action.payload)) {
          state.favorites.push(action.payload);
        }
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter((id) => id !== action.payload);
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
          action.payload._id
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

export const { setResults, setMatch, clearFavorite, clearBreeds, setDogsPage } =
  dogsSlice.actions;

export default dogsSlice.reducer;
