import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
  error: null,
  rekapData: [],
  rekapLoading: false,
  rekapError: null,
};

const presensiSlice = createSlice({
  name: "presensi",
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
    setRekapLoading: (state, action) => {
      state.rekapLoading = action.payload;
    },
    setRekapError: (state, action) => {
      state.rekapError = action.payload;
    },
    setRekapData: (state, action) => {
      state.rekapData = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setData,
  setRekapLoading,
  setRekapError,
  setRekapData,
} = presensiSlice.actions;
export default presensiSlice.reducer;
