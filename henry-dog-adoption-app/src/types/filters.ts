import React from "react";

export interface FilterState {
  breed: string[];
  zipCode: string[];
  ageMin: number;
  ageMax: number;
}

export interface FiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}
