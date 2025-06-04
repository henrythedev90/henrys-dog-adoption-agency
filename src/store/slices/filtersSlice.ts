import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Borough } from "@/enums/boroughs";
import { Gender } from "@/enums/genders";

export type PageSize = 20 | 40 | 60 | 80 | 100;

export const PAGE_SIZES: PageSize[] = [20, 40, 60, 80, 100];

interface FiltersState {
  breeds: string[];
  zipCodes: string[];
  boroughs: Borough[];
  genders: Gender[];
  ageMin: number | null;
  ageMax: number | null;
  size: PageSize;
  from: string | null;
  sort: string;
}

// Define default state as fallback
const defaultState: FiltersState = {
  breeds: [],
  zipCodes: [],
  boroughs: [],
  genders: [],
  ageMin: null,
  ageMax: null,
  size: 20,
  from: null,
  sort: "breed:asc",
};

// Load filters from localStorage if they exist
const loadFiltersFromStorage = (): FiltersState => {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const storedFilters = localStorage.getItem("dogFilters");
    if (storedFilters) {
      return JSON.parse(storedFilters);
    }
  } catch (error) {
    console.error("Failed to load filters from localStorage:", error);
  }

  return defaultState;
};

const initialState: FiltersState = loadFiltersFromStorage();

// Helper function to save filters to localStorage
const saveFiltersToStorage = (filters: FiltersState) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("dogFilters", JSON.stringify(filters));
    } catch (error) {
      console.error("Failed to save filters to localStorage:", error);
    }
  }
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<FiltersState>>) {
      // For arrays (breeds, zipCodes, and boroughs), we need to handle them specially
      if (action.payload.breeds !== undefined) {
        state.breeds = action.payload.breeds;
      }
      if (action.payload.zipCodes !== undefined) {
        state.zipCodes = action.payload.zipCodes;
      }
      if (action.payload.boroughs !== undefined) {
        state.boroughs = action.payload.boroughs;
      }
      if (action.payload.genders !== undefined) {
        state.genders = action.payload.genders;
      }

      // For other properties, we can use direct assignment
      if (action.payload.ageMin !== undefined) {
        state.ageMin = action.payload.ageMin;
      }
      if (action.payload.ageMax !== undefined) {
        state.ageMax = action.payload.ageMax;
      }
      if (action.payload.size !== undefined) {
        state.size = action.payload.size;
      }
      if (action.payload.from !== undefined) {
        state.from = action.payload.from;
      }
      if (action.payload.sort !== undefined) {
        state.sort = action.payload.sort;
      }
      if (action.payload.genders !== undefined) {
        state.genders = action.payload.genders;
      }

      // Save updated state to localStorage
      saveFiltersToStorage(state);
    },
    resetFilter() {
      // Clear localStorage when filters are reset
      if (typeof window !== "undefined") {
        localStorage.removeItem("dogFilters");
      }
      return defaultState;
    },
  },
});

export const { setFilters, resetFilter } = filterSlice.actions;
export default filterSlice.reducer;
