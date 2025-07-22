import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
  pengajuan: [],
  pengajuanPagination: { last_page: 1, current_page: 1, links: [] },
  pengajuanLoading: false,
};

const izinSlice = createSlice({
  name: "izin",
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPengajuan: (state, action) => {
      state.pengajuan = action.payload.data;
      state.pengajuanPagination = action.payload.pagination;
    },
    setPengajuanLoading: (state, action) => {
      state.pengajuanLoading = action.payload;
    },
  },
});

export const { setData, setLoading, setPengajuan, setPengajuanLoading } =
  izinSlice.actions;
export default izinSlice.reducer;
