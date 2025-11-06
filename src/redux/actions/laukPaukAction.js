import axios from "axios";
import Swal from "sweetalert2";

export const FETCH_LAUK_PAUK_REQUEST = "FETCH_LAUK_PAUK_REQUEST";
export const FETCH_LAUK_PAUK_SUCCESS = "FETCH_LAUK_PAUK_SUCCESS";
export const FETCH_LAUK_PAUK_FAILURE = "FETCH_LAUK_PAUK_FAILURE";

export const CREATE_LAUK_PAUK_REQUEST = "CREATE_LAUK_PAUK_REQUEST";
export const CREATE_LAUK_PAUK_SUCCESS = "CREATE_LAUK_PAUK_SUCCESS";
export const CREATE_LAUK_PAUK_FAILURE = "CREATE_LAUK_PAUK_FAILURE";

export const UPDATE_LAUK_PAUK_REQUEST = "UPDATE_LAUK_PAUK_REQUEST";
export const UPDATE_LAUK_PAUK_SUCCESS = "UPDATE_LAUK_PAUK_SUCCESS";
export const UPDATE_LAUK_PAUK_FAILURE = "UPDATE_LAUK_PAUK_FAILURE";

export const DELETE_LAUK_PAUK_REQUEST = "DELETE_LAUK_PAUK_REQUEST";
export const DELETE_LAUK_PAUK_SUCCESS = "DELETE_LAUK_PAUK_SUCCESS";
export const DELETE_LAUK_PAUK_FAILURE = "DELETE_LAUK_PAUK_FAILURE";

// Fetch lauk pauk
// export const fetchLaukPauk =
//   (filterUnit, isSuperAdmin,id) => async (dispatch, getState) => {
//     dispatch({ type: FETCH_LAUK_PAUK_REQUEST });
//     const { token } = getState().auth;

//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_API_URL}/api/lauk-pauk/get-by-id/${
//           isSuperAdmin ? `?unit_id=${filterUnit}` : `${id}`
//         }`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       dispatch({
//         type: FETCH_LAUK_PAUK_SUCCESS,
//         payload: response.data,
//       });
//     } catch (error) {
//       dispatch({
//         type: FETCH_LAUK_PAUK_FAILURE,
//         payload: "Gagal mengambil data lauk pauk",
//       });
//     }
//   };
export const fetchLaukPauk =
  (filterUnit, isSuperAdmin) => async (dispatch, getState) => {
    dispatch({ type: FETCH_LAUK_PAUK_REQUEST });
    const { token } = getState().auth;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/lauk-pauk/by-admin-unit${
          isSuperAdmin ? `?unit_id=${filterUnit}` : ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch({
        type: FETCH_LAUK_PAUK_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: FETCH_LAUK_PAUK_FAILURE,
        payload: "Gagal mengambil data lauk pauk",
      });
    }
  };

// Create lauk pauk
export const createLaukPauk =
  (data, filterUnit) => async (dispatch, getState) => {
    dispatch({ type: CREATE_LAUK_PAUK_REQUEST });
    const { token } = getState().auth;
    const { user } = getState().auth;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/lauk-pauk/create?${
          user.role == "super_admin" && `unit_id=${filterUnit}`
        }`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch({
        type: CREATE_LAUK_PAUK_SUCCESS,
        payload: response.data,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data lauk pauk berhasil ditambahkan",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      dispatch({
        type: CREATE_LAUK_PAUK_FAILURE,
        payload: "Gagal menambahkan data lauk pauk",
      });

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menambahkan data lauk pauk",
      });
    }
  };

// Update lauk pauk
export const updateLaukPauk = (id, data, filterUnit) => async (dispatch, getState) => {
  dispatch({ type: UPDATE_LAUK_PAUK_REQUEST });
  const { token } = getState().auth;
  const { user } = getState().auth;

  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/lauk-pauk/update/${id}?${
        user.role == "super_admin" && `unit_id=${filterUnit}`
      }`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    dispatch({
      type: UPDATE_LAUK_PAUK_SUCCESS,
      payload: response.data,
    });

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Data lauk pauk berhasil diperbarui",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_LAUK_PAUK_FAILURE,
      payload: "Gagal memperbarui data lauk pauk",
    });

    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Gagal memperbarui data lauk pauk",
    });
  }
};

// Delete lauk pauk
export const deleteLaukPauk = (id) => async (dispatch, getState) => {
  dispatch({ type: DELETE_LAUK_PAUK_REQUEST });
  const { token } = getState().auth;

  try {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/lauk-pauk/delete/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    dispatch({
      type: DELETE_LAUK_PAUK_SUCCESS,
      payload: id,
    });

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Data lauk pauk berhasil dihapus",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    dispatch({
      type: DELETE_LAUK_PAUK_FAILURE,
      payload: "Gagal menghapus data lauk pauk",
    });

    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Gagal menghapus data lauk pauk",
    });
  }
};
