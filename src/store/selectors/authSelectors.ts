import { RootState } from "../../store/index";

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectAuthName = (state: RootState) => state.auth.name;
