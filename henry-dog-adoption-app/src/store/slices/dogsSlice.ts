import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../lib/apiClient";
import { Dog } from "@/types/dog";

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

const dogsSlice = createSlice({
  name: "dogs",
  initialState,
  reducers: {
    setResults: (state, action: PayloadAction<Dog[]>) => {
      state.results = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter((dogId) => dogId !== id);
      } else {
        state.favorites.push(id);
      }
    },
    setMatch: (state, action: PayloadAction<Dog>) => {
      state.match = action.payload;
    },
    clearFavorite: (state) => {
      state.favorites = [];
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
      });
  },
});

export const {
  setResults,
  toggleFavorite,
  setMatch,
  clearFavorite,
  setDogsPage,
  clearDogs,
} = dogsSlice.actions;
export default dogsSlice.reducer;
