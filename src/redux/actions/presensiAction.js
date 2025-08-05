import axios from "axios";
import {
  setData,
  setError,
  setLoading,
  setRekapLoading,
  setRekapError,
  setRekapData,
  setDetailRekapLoading,
  setDetailRekapError,
  setDetailRekap,
  setDetailHistory,
  setDetailHistoryLoading,
  setDetailHistoryError,
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

export const fetchPresensiRekapBulananPegawai =
  (pegawai_id, tahun) => async (dispatch, getState) => {
    dispatch(setDetailRekapLoading(true));
    dispatch(setDetailRekapError(null));
    const { token } = getState().auth;
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/presensi/rekap-bulanan-pegawai?pegawai_id=${pegawai_id}&tahun=${tahun}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setDetailRekap(response.data));
      dispatch(setDetailRekapLoading(false));
    } catch {
      dispatch(setDetailRekapLoading(false));
      dispatch(
        setDetailRekapError("Gagal mengambil detail rekap bulanan pegawai")
      );
    }
  };

export const fetchPresensiDetailHistoryByUnit =
  (pegawai_id) => async (dispatch, getState) => {
    dispatch(setDetailHistoryLoading(true));
    dispatch(setDetailHistoryError(null));
    const { token } = getState().auth;
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/presensi/detail-history-by-unit?pegawai_id=${pegawai_id}&from=2024-07-01&to=2025-07-31`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setDetailHistory(response.data));
      dispatch(setDetailHistoryLoading(false));
    } catch {
      dispatch(setDetailHistoryLoading(false));
      dispatch(
        setDetailHistoryError("Gagal mengambil detail history presensi")
      );
    }
  };
