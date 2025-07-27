import axios from "axios";

export const FETCH_PEGAWAI_REQUEST = "FETCH_PEGAWAI_REQUEST";
export const FETCH_PEGAWAI_SUCCESS = "FETCH_PEGAWAI_SUCCESS";
export const FETCH_PEGAWAI_FAILURE = "FETCH_PEGAWAI_FAILURE";

export const fetchPegawai =
  (isSuperAdmin, token, page = 1) =>
  async (dispatch) => {
    dispatch({ type: FETCH_PEGAWAI_REQUEST });
    let url = "";
    if (isSuperAdmin) {
      url = `${import.meta.env.VITE_API_URL}/api/pegawai?page=${page}`;
    } else {
      url = `${import.meta.env.VITE_API_URL}/api/pegawai/by-unit-id-presensi`;
    }
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isSuperAdmin) {
        dispatch({
          type: FETCH_PEGAWAI_SUCCESS,
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
          type: FETCH_PEGAWAI_SUCCESS,
          payload: { data: res.data, pagination: null },
        });
      }
    } catch (err) {
      dispatch({
        type: FETCH_PEGAWAI_FAILURE,
        error: "Gagal mengambil data pegawai",
      });
    }
  };
