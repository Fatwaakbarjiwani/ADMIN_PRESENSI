import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
};

const hariLiburSlice = createSlice({
  name: "hariLibur",
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setData, setLoading } = hariLiburSlice.actions;
export default hariLiburSlice.reducer;
