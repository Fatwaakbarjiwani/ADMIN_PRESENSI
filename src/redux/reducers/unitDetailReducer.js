import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
  error: null,
  units: [], // Tambahan untuk data unit
};

const unitDetailSlice = createSlice({
  name: "unitDetail",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setData: (state, action) => {
      state.data = action.payload;
    },
    setUnits: (state, action) => {
      state.units = action.payload;
    },
  },
});

export const { setLoading, setError, setData, setUnits } =
  unitDetailSlice.actions;
export default unitDetailSlice.reducer;
