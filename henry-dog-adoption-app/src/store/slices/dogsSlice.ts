import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../lib/apiClient";
import { Dog } from "@/types/dog";

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

export const fetchMatch = createAsyncThunk(
  "dogs/fetchMatch",
  async (favoriteIds: string[]) => {
    try {
      const response = await apiClient.post<Dog>("/dogs/match", {
        favoriteIds,
      });
      return response.data;
    } catch (error: any) {
      throw error;
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
    clearDogs: (state) => {
      state.results = [];
      state.resultIds = [];
      state.totalPages = 1;
      state.page = 0;
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
      .addCase(fetchMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.match = action.payload;
        // Clear breeds when match is created
        state.results = [];
        state.resultIds = [];
        state.totalPages = 1;
        state.page = 0;
      })
      .addCase(fetchMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch match";
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
  clearDogs,
} = dogsSlice.actions;
export default dogsSlice.reducer;
