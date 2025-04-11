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
    const state = getState() as { filters: any };
    const filters = state.filters;
    try {
      // First, get the search results with IDs
      const searchResponse = await apiClient.get("/dogs/search", {
        params: {
          breed: filters.breeds.length ? filters.breeds : undefined,
          zipCodes: filters.zipCodes.length ? filters.zipCodes : undefined,
          ageMin: filters.ageMin || undefined,
          ageMax: filters.ageMax || undefined,
          size: 25,
          from: 0,
          sort: "breed:asc",
        },
        withCredentials: true,
      });

      const resultIds = searchResponse.data.resultIds || [];

      // Then, fetch the actual dog data using the IDs
      if (resultIds.length > 0) {
        const dogsResponse = await apiClient.post("/dogs", resultIds, {
          withCredentials: true,
        });
        return {
          resultIds,
          dogs: dogsResponse.data || [],
        };
      }

      return {
        resultIds: [],
        dogs: [],
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
          (action.payload.resultIds?.length || 0) / 25
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
} = dogsSlice.actions;
export default dogsSlice.reducer;
