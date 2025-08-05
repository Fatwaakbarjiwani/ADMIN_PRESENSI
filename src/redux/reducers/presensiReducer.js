import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
  error: null,
  rekapData: [],
  rekapLoading: false,
  rekapError: null,
  detailRekap: [],
  detailRekapLoading: false,
  detailRekapError: null,
  detailHistory: [],
  detailHistoryLoading: false,
  detailHistoryError: null,
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
    setDetailRekap: (state, action) => {
      state.detailRekap = action.payload;
    },
    setDetailRekapLoading: (state, action) => {
      state.detailRekapLoading = action.payload;
    },
    setDetailRekapError: (state, action) => {
      state.detailRekapError = action.payload;
    },
    setDetailHistory: (state, action) => {
      state.detailHistory = action.payload;
    },
    setDetailHistoryLoading: (state, action) => {
      state.detailHistoryLoading = action.payload;
    },
    setDetailHistoryError: (state, action) => {
      state.detailHistoryError = action.payload;
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
  setDetailRekap,
  setDetailRekapLoading,
  setDetailRekapError,
  setDetailHistory,
  setDetailHistoryLoading,
  setDetailHistoryError,
} = presensiSlice.actions;
export default presensiSlice.reducer;
