import axios from "axios";
import { setAdminLoading, setAdminData } from "../reducers/adminReducer";
import Swal from "sweetalert2";

export const fetchAdmin = () => async (dispatch, getState) => {
  dispatch(setAdminLoading(true));
  try {
    const { token } = getState().auth;

    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(setAdminData(res.data));
    dispatch(setAdminLoading(false));
  } catch {
    dispatch(setAdminLoading(false));
  }
};

export const createAdmin =
  (data, onSuccess, onError) => async (dispatch, getState) => {
    dispatch(setAdminLoading(true));
    try {
      const { token } = getState().auth;

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/create`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(fetchAdmin(token));
      dispatch(setAdminLoading(false));
      if (onSuccess) onSuccess();
      Swal.fire({
        icon: "success",
        title: "Berhasil tambah admin",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      let msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal menyimpan data admin";
      if (error.response?.data?.errors) {
        msg = Object.values(error.response.data.errors).flat().join("\n");
      }
      dispatch(setAdminLoading(false));
      if (onError) onError(error);
      Swal.fire({ icon: "error", title: "Validasi Gagal", text: msg });
    }
  };

export const updateAdmin =
  (id, data, onSuccess, onError) => async (dispatch, getState) => {
    dispatch(setAdminLoading(true));
    try {
      const { token } = getState().auth;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/update/${id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(fetchAdmin(token));
      dispatch(setAdminLoading(false));
      if (onSuccess) onSuccess();
      Swal.fire({
        icon: "success",
        title: "Berhasil update admin",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      let msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal menyimpan data admin";
      if (error.response?.data?.errors) {
        msg = Object.values(error.response.data.errors).flat().join("\n");
      }
      dispatch(setAdminLoading(false));
      if (onError) onError(error);
      Swal.fire({ icon: "error", title: "Validasi Gagal", text: msg });
    }
  };

export const deleteAdmin =
  (id, onSuccess, onError) => async (dispatch, getState) => {
    dispatch(setAdminLoading(true));
    try {
      const { token } = getState().auth;
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(fetchAdmin(token));
      dispatch(setAdminLoading(false));
      if (onSuccess) onSuccess();
      Swal.fire({
        icon: "success",
        title: "Admin berhasil dihapus",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus admin";
      dispatch(setAdminLoading(false));
      if (onError) onError(error);
      Swal.fire({ icon: "error", title: "Gagal menghapus admin", text: msg });
    }
  };
