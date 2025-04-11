import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/apiClient";

interface BreedState {
  breeds: string[];
  loading: boolean;
  error: string | null;
}

const initialState: BreedState = {
  breeds: [],
  loading: false,
  error: null,
};

export const fetchBreeds = createAsyncThunk("breeds/fetchBreeds", async () => {
  try {
    const response = await apiClient.get("/dogs/breeds", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
});

const breedSlice = createSlice({
  name: "breeds",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBreeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBreeds.fulfilled, (state, action) => {
        state.loading = false;
        state.breeds = action.payload;
      })
      .addCase(fetchBreeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch breeds.";
      });
  },
});

export default breedSlice.reducer;
