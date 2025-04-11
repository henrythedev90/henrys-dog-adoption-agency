import { RootState } from "../../store/index";

export const selectBreeds = (state: RootState) => state.breeds.breeds;
export const selectBreedsLoading = (state: RootState) => state.breeds.loading;
export const selectBreedsError = (state: RootState) => state.breeds.error;
