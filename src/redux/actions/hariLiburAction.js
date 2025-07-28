import axios from "axios";
import Swal from "sweetalert2";

const baseURL = import.meta.env.VITE_API_URL;

// Fetch hari libur
export const fetchHariLibur = (bulan, tahun) => async (dispatch, getState) => {
  dispatch({ type: "hariLibur/setLoading", payload: true });
  const { token } = getState().auth;
  try {
    const res = await axios.get(
      `${baseURL}/api/hari-libur?bulan=${bulan}&tahun=${tahun}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch({ type: "hariLibur/setData", payload: res.data });
  } catch {
    dispatch({ type: "hariLibur/setData", payload: [] });
  } finally {
    dispatch({ type: "hariLibur/setLoading", payload: false });
  }
};

// Tambah hari libur
export const createHariLibur =
  (data, onSuccess) => async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      await axios.post(`${baseURL}/api/hari-libur/multiple-create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil tambah hari libur",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
      // Optionally refetch
      // dispatch(fetchHariLibur(...));
    } catch {
      Swal.fire({ icon: "error", title: "Gagal menambah hari libur" });
    }
  };

// Update hari libur
export const updateHariLibur =
  (data, onSuccess) => async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      await axios.put(`${baseURL}/api/hari-libur/multiple-update`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil update hari libur",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
      // Optionally refetch
      // dispatch(fetchHariLibur(...));
    } catch {
      Swal.fire({ icon: "error", title: "Gagal update hari libur" });
    }
  };

// Hapus hari libur
export const deleteHariLibur =
  (data, onSuccess) => async (dispatch, getState) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`${baseURL}/api/hari-libur/multiple-delete`, {
        data: {
          unit_detail_ids: data.unit_detail_ids,
          tanggal: data.tanggal,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "Hari libur berhasil dihapus",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
      // Optionally refetch
      // dispatch(fetchHariLibur(...));
    } catch {
      Swal.fire({ icon: "error", title: "Gagal menghapus hari libur" });
    }
  };
