import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: { data: [], links: [], current_page: 1, last_page: 1 },
  loading: false,
  error: null,
};

const tambahPegawaiSlice = createSlice({
  name: "tambahPegawai",
  initialState,
  reducers: {
    setTambahPegawaiData: (state, action) => {
      state.data = action.payload;
    },
    setTambahPegawaiLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTambahPegawaiError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTambahPegawaiData,
  setTambahPegawaiLoading,
  setTambahPegawaiError,
} = tambahPegawaiSlice.actions;
export default tambahPegawaiSlice.reducer; 