import React from "react";

export interface FilterState {
  breeds: string[];
  zipCode: string[];
  ageMin: number;
  ageMax: number;
  sort: "asc" | "desc";
  pageCursor: string | null;
}

export interface FiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}
