import { setData } from "../reducers/dashboardReducer";

const baseURL = import.meta.env.VITE_API_URL;

export const fetchDashboard = (bulan,tahun) => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;

    const res = await fetch(`${baseURL}/api/dashboard?bulan=${bulan}&tahun=${tahun}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Gagal mengambil data dashboard");
    const data = await res.json();
    dispatch(setData(data));
  } catch (err) {
    err.message;
  }
};
