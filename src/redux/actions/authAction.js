import axios from "axios";
import {
  setLoading,
  setError,
  setUser,
  setToken,
} from "../reducers/authReducer";
import Swal from "sweetalert2";

export const login =
  (email, password, navigate, notify) => async (dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/login`,
        {
          email,
          password,
        }
      );
      if (response) {
        dispatch(setLoading(false));
        dispatch(setToken(response.data.token));
        notify("success", response.data.message);
        dispatch(getMe(navigate));
        navigate("/");
      }
    } catch (error) {
      dispatch(setLoading(false));
      const msg = error.response?.data?.message || "Login gagal";
      dispatch(setError(msg));
      notify("error", msg);
    }
  };

export const logout = (navigate) => async (dispatch) => {
  Swal.fire({
    title: "Konfirmasi Logout",
    text: "Apakah Anda yakin ingin keluar?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Logout",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      dispatch(setToken(null));
      dispatch(setUser(null));
      Swal.fire({
        title: "Logout",
        text: "Berhasil logout",
        icon: "success",
      });
      navigate("/login");
    }
  });
};

export const getMe = (navigate) => async (dispatch, getState) => {
  const { token } = getState().auth;
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/admin/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = response.data;
    dispatch(setUser(data));
    if (data.role === "monitoring") {
      navigate("/monitoring_presensi");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return;
    }
  }
};
