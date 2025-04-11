import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Location } from "@/types/location";

interface LocationState {
  zipCodes: string[];
  selectedZip: string | null;
  locations: Record<string, Location>;
}

const initialState: LocationState = {
  zipCodes: [],
  selectedZip: null,
  locations: {},
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setZipCodes(state, action: PayloadAction<string[]>) {
      state.zipCodes = action.payload;
    },
    setSelectedZip(state, action: PayloadAction<string | null>) {
      state.selectedZip = action.payload;
    },
    setLocations(state, action: PayloadAction<Location[]>) {
      for (const loc of action.payload) {
        state.locations[loc.zipCode] = loc;
      }
    },
  },
});

export const { setZipCodes, setSelectedZip, setLocations } =
  locationSlice.actions;
export default locationSlice.reducer;
