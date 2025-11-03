import { setData, setLoading } from "../reducers/dashboardReducer";

const baseURL = import.meta.env.VITE_API_URL;

export const fetchDashboard = (bulan, tahun) => async (dispatch, getState) => {
  try {
    // Set loading true sebelum fetch
    dispatch(setLoading(true));
    
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
    console.error("Error fetching dashboard:", err.message);
  } finally {
    // Set loading false setelah selesai (sukses atau error)
    dispatch(setLoading(false));
  }
};
