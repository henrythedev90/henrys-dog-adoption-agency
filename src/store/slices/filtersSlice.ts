import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const PAGE_SIZES = [8, 16, 20, 24] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

interface FiltersState {
  breeds: string[];
  zipCodes: string[];
  ageMin: number | null;
  ageMax: number | null;
  size: PageSize;
  from: string | null;
  sort: string;
}

// Load filters from localStorage if they exist
const loadFiltersFromStorage = (): FiltersState => {
  if (typeof window === "undefined") {
    return {
      breeds: [],
      zipCodes: [],
      ageMin: null,
      ageMax: null,
      size: 20,
      from: null,
      sort: "breed:asc",
    };
  }

  try {
    const storedFilters = localStorage.getItem("dogFilters");
    if (storedFilters) {
      return JSON.parse(storedFilters);
    }
  } catch (error) {
    console.error("Failed to load filters from localStorage:", error);
  }

  return {
    breeds: [],
    zipCodes: [],
    ageMin: null,
    ageMax: null,
    size: 20,
    from: null,
    sort: "breed:asc",
  };
};

// Define default state as fallback
const defaultState: FiltersState = {
  breeds: [],
  zipCodes: [],
  ageMin: null,
  ageMax: null,
  size: 20,
  from: null,
  sort: "breed:asc",
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
      // For arrays (breeds and zipCodes), we need to handle them specially
      if (action.payload.breeds !== undefined) {
        state.breeds = action.payload.breeds;
      }
      if (action.payload.zipCodes !== undefined) {
        state.zipCodes = action.payload.zipCodes;
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
