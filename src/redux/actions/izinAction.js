import axios from "axios";
import Swal from "sweetalert2";

// Fetch jenis izin (sakit/cuti/izin)
export const fetchJenisIzin = (jenis) => async (dispatch, getState) => {
  dispatch({ type: "izin/setLoading", payload: true });
  const { token } = getState().auth;
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/${jenis}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch({ type: "izin/setData", payload: res.data });
  } catch {
    dispatch({ type: "izin/setData", payload: [] });
    Swal.fire({ icon: "error", title: "Gagal mengambil data izin" });
  } finally {
    dispatch({ type: "izin/setLoading", payload: false });
  }
};

// Tambah jenis izin
export const createJenisIzin =
  (jenis, nama, onSuccess) => async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/${jenis}/create`,
        { jenis: nama },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        icon: "success",
        title: "Berhasil tambah data izin",
        timer: 1200,
        showConfirmButton: false,
      });
      dispatch(fetchJenisIzin(jenis));
      if (onSuccess) onSuccess();
    } catch {
      Swal.fire({ icon: "error", title: "Gagal menambah data izin" });
    }
  };

// Update jenis izin
export const updateJenisIzin =
  (jenis, id, nama, onSuccess) => async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/${jenis}/update/${id}`,
        { jenis: nama },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        icon: "success",
        title: "Berhasil update data izin",
        timer: 1200,
        showConfirmButton: false,
      });
      dispatch(fetchJenisIzin(jenis));
      if (onSuccess) onSuccess();
    } catch {
      Swal.fire({ icon: "error", title: "Gagal update data izin" });
    }
  };

// Hapus jenis izin
export const deleteJenisIzin = (jenis, id) => async (dispatch, getState) => {
  const { token } = getState().auth;
  try {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/${jenis}/delete/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    Swal.fire({
      icon: "success",
      title: "Data izin berhasil dihapus",
      timer: 1200,
      showConfirmButton: false,
    });
    dispatch(fetchJenisIzin(jenis));
  } catch {
    Swal.fire({ icon: "error", title: "Gagal menghapus data izin" });
  }
};

// Fetch pengajuan izin/cuti/sakit (untuk admin_unit)
export const fetchPengajuanIzin =
  (type = "izin", page = 1) =>
  async (dispatch, getState) => {
    dispatch({ type: "izin/setPengajuanLoading", payload: true });
    const { token } = getState().auth;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/pengajuan-${type}?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch({
        type: "izin/setPengajuan",
        payload: {
          data: res.data.data,
          pagination: {
            last_page: res.data.last_page,
            current_page: res.data.current_page,
            links: res.data.links,
          },
        },
      });
    } catch {
      dispatch({
        type: "izin/setPengajuan",
        payload: {
          data: [],
          pagination: { last_page: 1, current_page: 1, links: [] },
        },
      });
      Swal.fire({ icon: "error", title: "Gagal mengambil data pengajuan" });
    } finally {
      dispatch({ type: "izin/setPengajuanLoading", payload: false });
    }
  };

// Approve/tolak pengajuan izin
export const approvePengajuanIzin =
  (id, status, keterangan_admin, onSuccess) => async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/pengajuan-izin/approve/${id}`,
        { status, keterangan_admin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        icon: "success",
        title: `Pengajuan ${status === "diterima" ? "disetujui" : "ditolak"}`,
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
    } catch {
      Swal.fire({ icon: "error", title: "Gagal memproses pengajuan" });
    }
  };
