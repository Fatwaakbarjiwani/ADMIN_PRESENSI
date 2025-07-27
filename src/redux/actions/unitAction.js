import axios from "axios";
import Swal from "sweetalert2";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Action Types
export const FETCH_UNIT_REQUEST = "FETCH_UNIT_REQUEST";
export const FETCH_UNIT_SUCCESS = "FETCH_UNIT_SUCCESS";
export const FETCH_UNIT_FAILURE = "FETCH_UNIT_FAILURE";

export const CREATE_UNIT_REQUEST = "CREATE_UNIT_REQUEST";
export const CREATE_UNIT_SUCCESS = "CREATE_UNIT_SUCCESS";
export const CREATE_UNIT_FAILURE = "CREATE_UNIT_FAILURE";

export const UPDATE_UNIT_REQUEST = "UPDATE_UNIT_REQUEST";
export const UPDATE_UNIT_SUCCESS = "UPDATE_UNIT_SUCCESS";
export const UPDATE_UNIT_FAILURE = "UPDATE_UNIT_FAILURE";

export const DELETE_UNIT_REQUEST = "DELETE_UNIT_REQUEST";
export const DELETE_UNIT_SUCCESS = "DELETE_UNIT_SUCCESS";
export const DELETE_UNIT_FAILURE = "DELETE_UNIT_FAILURE";

// Fetch Units
export const fetchUnits = (token, onSuccess, onError) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_UNIT_REQUEST });
    try {
      const response = await axios.get(`${baseURL}/api/unit`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch({
        type: FETCH_UNIT_SUCCESS,
        payload: response.data,
      });
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      dispatch({
        type: FETCH_UNIT_FAILURE,
        payload: error.response?.data?.message || "Gagal mengambil data unit",
      });
      if (onError) onError(error);
    }
  };
};

// Create Unit
export const createUnit = (data, onSuccess, onError) => {
  return async (dispatch, getState) => {
    const { token } = getState().auth;

    dispatch({ type: CREATE_UNIT_REQUEST });
    try {
      const response = await axios.post(`${baseURL}/api/unit/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      dispatch({
        type: CREATE_UNIT_SUCCESS,
        payload: response.data.data,
      });
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      dispatch({
        type: CREATE_UNIT_FAILURE,
        payload: error.response?.data?.message || "Gagal membuat unit",
      });
      if (onError) onError(error);
    }
  };
};

// Update Unit
export const updateUnit = (id, data) => {
  return async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      const response = await axios.put(
        `${baseURL}/api/unit/update/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response)
        Swal.fire({
          icon: "success",
          title:  "Unit berhasil diupdate",
          showConfirmButton: false,
        });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: `${error.response.data.message}` || "Gagal mengupdate unit",
      });
    }
  };
};

// Delete Unit
export const deleteUnit = (id) => {
  return async (dispatch, getState) => {
    const { token } = getState().auth;

    dispatch({ type: DELETE_UNIT_REQUEST });
    try {
      const response = await axios.delete(`${baseURL}/api/unit/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response) {
        Swal.fire({
          icon: "success",
          title: `${response.data.message}` || "Unit berhasil dihapus",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: `${error.response.data.message}` || "Gagal menghapus unit",
      });
    }
  };
};
