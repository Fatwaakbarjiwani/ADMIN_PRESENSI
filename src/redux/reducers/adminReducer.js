import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminData: (state, action) => {
      state.data = action.payload;
    },
    setAdminLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setAdminData, setAdminLoading } = adminSlice.actions;
export default adminSlice.reducer;
