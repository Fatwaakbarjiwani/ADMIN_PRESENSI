import axios from "axios";

const BASE = `${import.meta.env.VITE_API_URL}/api/admin/monitoring`;

export const fetchAdminMonitoring = () => async (dispatch, getState) => {
  try {
    const { token } = getState().auth;
    const res = await axios.get(`${BASE}/get-all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createAdminMonitoring =
  (data, onSuccess, onError) => async (dispatch, getState) => {
    try {
      const { token } = getState().auth;
      await axios.post(`${BASE}/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  };

export const updateAdminMonitoring =
  (id, data, onSuccess, onError) => async (dispatch, getState) => {
    try {
      const { token } = getState().auth;
      await axios.put(`${BASE}/update/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  };

export const deleteAdminMonitoring =
  (id, onSuccess, onError) => async (dispatch, getState) => {
    try {
      const { token } = getState().auth;
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  };
