import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
  error: null,
  pegawai: [],
  pegawaiPagination: { last_page: 1, current_page: 1, links: [] },
  pengajuan: [],
  pengajuanPagination: { last_page: 1, current_page: 1, links: [] },
  pengajuanLoading: false,
  unit_id: null,
};

const shiftSlice = createSlice({
  name: "shift",
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
    setPegawai: (state, action) => {
      state.pegawai = action.payload.data;
      state.pegawaiPagination = action.payload.pagination;
    },
    setPengajuan: (state, action) => {
      state.pengajuan = action.payload.data;
      state.pengajuanPagination = action.payload.pagination;
    },
    setPengajuanLoading: (state, action) => {
      state.pengajuanLoading = action.payload;
    },
    setUnitId: (state, action) => {
      state.unit_id = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setData,
  setPegawai,
  setPengajuan,
  setPengajuanLoading,
  setUnitId,
} = shiftSlice.actions;
export default shiftSlice.reducer;
