import { setData, setLoading } from "../reducers/dashboardReducer";

const baseURL = import.meta.env.VITE_API_URL;

export const fetchDashboard = (bulan, tahun, unitId = null) => async (dispatch, getState) => {
  try {
    // Set loading true sebelum fetch
    dispatch(setLoading(true));
    
    const { token } = getState().auth;

    const unitParam = unitId ? `&unit_id=${unitId}` : "";
    const res = await fetch(`${baseURL}/api/dashboard?bulan=${bulan}&tahun=${tahun}${unitParam}`, {
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
