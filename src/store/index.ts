import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dogsReducer from "./slices/dogsSlice";
import filtersReducer from "./slices/filtersSlice";
import breedReducer from "./slices/breedSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    breeds: breedReducer,
    dogs: dogsReducer,
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
