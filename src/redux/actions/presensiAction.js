import axios from "axios";
import {
  setData,
  setError,
  setLoading,
  setRekapLoading,
  setRekapError,
  setRekapData,
} from "../reducers/presensiReducer";

export const fetchPresensiHistoryByUnit = () => async (dispatch, getState) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  const { token } = getState().auth;
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/presensi/history-by-unit`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dispatch(setData(response.data));
    dispatch(setLoading(false));
  } catch {
    dispatch(setLoading(false));
    dispatch(setError("Gagal mengambil data presensi"));
  }
};

export const fetchPresensiRekapByUnit =
  (tanggal) => async (dispatch, getState) => {
    dispatch(setRekapLoading(true));
    dispatch(setRekapError(null));
    const { token } = getState().auth;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/presensi/rekap-by-unit?${
          tanggal ? `tanggal=${tanggal}` : ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setRekapData(response.data));
      dispatch(setRekapLoading(false));
    } catch {
      dispatch(setRekapLoading(false));
      dispatch(setRekapError("Gagal mengambil data rekap presensi"));
    }
  };
