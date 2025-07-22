import axios from "axios";
import Swal from "sweetalert2";
import { setData, setError, setLoading } from "../reducers/unitDetailReducer";

export const fetchUnitDetails = () => async (dispatch, getState) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  const { token } = getState().auth;
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/unit-detail`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(setData(response.data));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setLoading(false));
    dispatch(
      setError(
        error.response?.data?.message || "Gagal mengambil data unit detail"
      )
    );
  }
};

export const createUnitDetail =
  (token, unit, name, lokasi, onSuccess) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/unit-detail/create`,
        { unit, name, lokasi },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(fetchUnitDetails(token));
      dispatch(setLoading(false));
      Swal.fire({
        icon: "success",
        title: "Unit detail berhasil ditambah",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(
        setError(error.response?.data?.message || "Gagal menambah unit detail")
      );
      Swal.fire({
        icon: "error",
        title: "Gagal menambah unit detail",
        text: error.response?.data?.message || "Gagal menambah unit detail",
      });
    }
  };

export const deleteUnitDetail =
  (id, onSuccess) => async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/unit-detail/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Unit detail berhasil dihapus",
        timer: 1200,
        showConfirmButton: false,
      });
      // Refresh data setelah delete
      if (onSuccess) onSuccess();
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(
        setError(error.response?.data?.message || "Gagal menghapus unit detail")
      );
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus unit detail",
        text: error.response?.data?.message || "Gagal menghapus unit detail",
      });
    }
  };

// Ambil unit detail milik user tertentu
export const fetchUnitDetailByUserId =
  (userId) => async (dispatch, getState) => {
    dispatch(setError(null));
    const { token } = getState().auth;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/unit-detail/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setData(response.data));
    } catch (error) {
      dispatch(
        setError(
          error.response?.data?.message ||
            "Gagal mengambil data unit detail user"
        )
      );
    }
  };

// Create unit detail dengan unit_id statis
export const createUnitDetailV2 =
  (name, lokasi, onSuccess) => async (dispatch, getState) => {
    try {
      const { token } = getState().auth;
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/unit-detail/create`,
        { name, lokasi },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Unit detail berhasil ditambah",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(
        setError(error.response?.data?.message || "Gagal menambah unit detail")
      );
      Swal.fire({
        icon: "error",
        title: "Gagal menambah unit detail",
        text: error.response?.data?.message || "Gagal menambah unit detail",
      });
    }
  };
export const createUnitDetailV1 =
  (name, lokasi, onSuccess) => async (dispatch, getState) => {
    try {
      const { token } = getState().auth;
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/unit-detail/create`,
        { name: name.name, lokasi: name.lokasi, unit_id: name.unit_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Unit detail berhasil ditambah",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(
        setError(error.response?.data?.message || "Gagal menambah unit detail")
      );
      Swal.fire({
        icon: "error",
        title: "Gagal menambah unit detail",
        text: error.response?.data?.message || "Gagal menambah unit detail",
      });
    }
  };

// Ambil semua unit (untuk super_admin)
export const fetchAllUnit = () => async (dispatch, getState) => {
  const { token } = getState().auth;
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/unit`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({ type: "unitDetail/setUnits", payload: response.data });
  } catch {
    // Optional: handle error
  }
};
