import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
  error: null,
  rekapData: [],
  lemburData: [],
  rekapLoading: false,
  rekapError: null,
  detailRekap: [],
  detailRekapLoading: false,
  detailRekapError: null,
  detailHistory: [],
  detailHistoryLoading: false,
  detailHistoryError: null,
  dinasData: [],
  dinasLoading: false,
  laporanKehadiran: null,
  laporanKehadiranLoading: false,
  laporanKehadiranError: null,
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
    setLemburData: (state, action) => {
      state.lemburData = action.payload;
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
    setDinasData: (state, action) => {
      state.dinasData = action.payload;
    },
    setDinasLoading: (state, action) => {
      state.dinasLoading = action.payload;
    },
    setLaporanKehadiran: (state, action) => {
      state.laporanKehadiran = action.payload;
    },
    setLaporanKehadiranLoading: (state, action) => {
      state.laporanKehadiranLoading = action.payload;
    },
    setLaporanKehadiranError: (state, action) => {
      state.laporanKehadiranError = action.payload;
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
  setLemburData,
  setDetailRekap,
  setDetailRekapLoading,
  setDetailRekapError,
  setDetailHistory,
  setDetailHistoryLoading,
  setDetailHistoryError,
  setDinasData,
  setDinasLoading,
  setLaporanKehadiran,
  setLaporanKehadiranLoading,
  setLaporanKehadiranError,
} = presensiSlice.actions;
export default presensiSlice.reducer;
