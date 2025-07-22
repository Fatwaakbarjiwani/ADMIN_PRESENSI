import axios from "axios";
import Swal from "sweetalert2";
import { setData, setError, setLoading } from "../reducers/shiftReducer";

export const fetchShifts = () => async (dispatch, getState) => {
  dispatch(setError(null));
  const { token } = getState().auth;
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/shift`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(setData(response.data));
  } catch (error) {
    dispatch(
      setError(error.response?.data?.message || "Gagal mengambil data shift")
    );
  }
};

// Tambah shift
export const createShift = (name, onSuccess) => async (dispatch, getState) => {
  const { token } = getState().auth;
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/shift/create`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(fetchShifts());
    Swal.fire({
      icon: "success",
      title: "Shift berhasil ditambah",
      timer: 1200,
      showConfirmButton: false,
    });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Gagal menambah shift"));
    Swal.fire({
      icon: "error",
      title: "Gagal menambah shift",
      text: error.response?.data?.message || "Gagal menambah shift",
    });
  }
};

// Hapus shift
export const deleteShift = (id, onSuccess) => async (dispatch, getState) => {
  dispatch(setLoading(true));
  const { token } = getState().auth;
  try {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/shift/delete/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(fetchShifts());
    dispatch(setLoading(false));
    Swal.fire({
      icon: "success",
      title: "Shift berhasil dihapus",
      timer: 1200,
      showConfirmButton: false,
    });
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(
      setError(error.response?.data?.message || "Gagal menghapus shift")
    );
    Swal.fire({
      icon: "error",
      title: "Gagal menghapus shift",
      text: error.response?.data?.message || "Gagal menghapus shift",
    });
  }
};

// Update shift
export const updateShift =
  (id, name, onSuccess) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    const { token } = getState().auth;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/shift/update/${id}`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(fetchShifts());
      dispatch(setLoading(false));
      Swal.fire({
        icon: "success",
        title: "Shift berhasil diupdate",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(
        setError(error.response?.data?.message || "Gagal mengupdate shift")
      );
      Swal.fire({
        icon: "error",
        title: "Gagal mengupdate shift",
        text: error.response?.data?.message || "Gagal mengupdate shift",
      });
    }
  };

// Tambah detail shift
export const createShiftDetail =
  (id, detail, onSuccess) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    const { token } = getState().auth;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/shift-detail/create`,
        detail,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setLoading(false));
      Swal.fire({
        icon: "success",
        title: "Detail shift berhasil ditambah",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      dispatch(setLoading(false));
      Swal.fire({
        icon: "error",
        title: "Gagal menambah detail shift",
        text: error.response?.data?.message || "Gagal menambah detail shift",
      });
    }
  };

// Update detail shift
export const updateShiftDetail =
  (id, detail, onSuccess) => async (dispatch, getState) => {
    // console.log(detail.id);

    dispatch(setLoading(true));
    const { token } = getState().auth;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/shift-detail/update/${detail.id}`,
        detail,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setLoading(false));
      Swal.fire({
        icon: "success",
        title: "Detail shift berhasil diupdate",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      dispatch(setLoading(false));
      Swal.fire({
        icon: "error",
        title: "Gagal mengupdate detail shift",
        text: error.response?.data?.message || "Gagal mengupdate detail shift",
      });
    }
  };

// Tambah: Ambil data pegawai sesuai role
export const fetchPegawai =
  (page = 1) =>
  async (dispatch, getState) => {
    dispatch(setLoading(true));
    const { token, user } = getState().auth;
    let url = "";
    if (user?.role === "super_admin") {
      url = `${import.meta.env.VITE_API_URL}/api/pegawai?page=${page}`;
    } else {
      url = `${import.meta.env.VITE_API_URL}/api/pegawai/by-unit-id-presensi`;
    }
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (user?.role === "super_admin") {
        dispatch({
          type: "shift/setPegawai",
          payload: {
            data: res.data.data,
            pagination: {
              last_page: res.data.last_page,
              current_page: res.data.current_page,
              links: res.data.links,
            },
          },
        });
      } else {
        dispatch({
          type: "shift/setPegawai",
          payload: {
            data: res.data,
            pagination: { last_page: 1, current_page: 1, links: [] },
          },
        });
      }
      dispatch(setLoading(false));
    } catch {
      dispatch({
        type: "shift/setPegawai",
        payload: {
          data: [],
          pagination: { last_page: 1, current_page: 1, links: [] },
        },
      });
      dispatch(setLoading(false));
    }
  };

// Tambah: Assign pegawai ke shift detail
export const assignPegawaiToShift =
  (shift_detail_id, pegawai_ids, onSuccess) => async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/shift-detail/add-pegawai-to-shift-detail`,
        { shift_detail_id, pegawai_ids },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        icon: "success",
        title: "Berhasil mengatur shift!",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
      // Optionally refresh pegawai
      dispatch(fetchPegawai());
    } catch {
      Swal.fire({ icon: "error", title: "Gagal mengatur shift" });
    }
  };

// Ambil daftar pengajuan izin/cuti/sakit (untuk admin_unit)
export const fetchPengajuanIzin =
  (type = "izin", page = 1) =>
  async (dispatch, getState) => {
    dispatch({ type: "shift/setPengajuanLoading", payload: true });
    const { token } = getState().auth;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/pengajuan-${type}?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch({
        type: "shift/setPengajuan",
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
        type: "shift/setPengajuan",
        payload: {
          data: [],
          pagination: { last_page: 1, current_page: 1, links: [] },
        },
      });
    } finally {
      dispatch({ type: "shift/setPengajuanLoading", payload: false });
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
      // Optionally refresh pengajuan
    } catch {
      Swal.fire({ icon: "error", title: "Gagal memproses pengajuan" });
    }
  };
