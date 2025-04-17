import { RootState } from "../../store/index";

export const selectDogs = (state: RootState) => state.dogs.results;
export const selectDogsLoading = (state: RootState) => state.dogs.loading;
export const selectDogsError = (state: RootState) => state.dogs.error;
export const selectDogsTotalPages = (state: RootState) => state.dogs.totalPages;
export const selectDogsPage = (state: RootState) => state.dogs.page;
export const selectDogFavorite = (state: RootState) => state.dogs.favorites;
export const selectDogMatch = (state: RootState) => state.dogs.match;
