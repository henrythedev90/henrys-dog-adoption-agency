import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  breeds: string[];
  zipCodes: string[];
  ageMin: number | null;
  ageMax: number | null;
  size: number;
  from: string | null;
  sort: string;
}

const initialState: FiltersState = {
  breeds: [],
  zipCodes: [],
  ageMin: null,
  ageMax: null,
  size: 25,
  from: null,
  sort: "breed:asc",
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<FiltersState>>) {
      return { ...state, ...action.payload };
    },
    resetFilter() {
      return initialState;
    },
  },
});

export const { setFilters, resetFilter } = filterSlice.actions;
export default filterSlice.reducer;
