import axios from "axios";
import {
  setTambahPegawaiData,
  setTambahPegawaiLoading,
} from "../reducers/tambahPegawaiReducer";
import Swal from "sweetalert2";

export const FETCH_PEGAWAI_REQUEST = "FETCH_PEGAWAI_REQUEST";
export const FETCH_PEGAWAI_SUCCESS = "FETCH_PEGAWAI_SUCCESS";
export const FETCH_PEGAWAI_FAILURE = "FETCH_PEGAWAI_FAILURE";

export const fetchPegawai =
  (isSuperAdmin, token, page = 1, searchValue = "") =>
  async (dispatch) => {
    dispatch({ type: FETCH_PEGAWAI_REQUEST });
    let url = "";

    if (isSuperAdmin) {
      url = `${
        import.meta.env.VITE_API_URL
      }/api/pegawai?page=${page}&&search=${searchValue}`;
    } else {
      url = `${
        import.meta.env.VITE_API_URL
      }/api/pegawai/by-unit-id-presensi?page=${page}&&search=${searchValue}`;
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
          payload: {
            data: res.data.data,
            pagination: {
              last_page: res.data.last_page,
              current_page: res.data.current_page,
              links: res.data.links,
            },
          },
        });
      }
    } catch (err) {
      dispatch({
        type: FETCH_PEGAWAI_FAILURE,
        error: "Gagal mengambil data pegawai",
      });
    }
  };

// Fetch pegawai untuk kebutuhan tambah pegawai ke unit detail
export const fetchTambahPegawaiList =
  (page = 1, searchValue) =>
  async (dispatch, getState) => {
    dispatch(setTambahPegawaiLoading(true));
    const { token } = getState().auth;
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/pegawai?page=${page}&&search=${searchValue}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setTambahPegawaiData(res.data));
    } catch {
      dispatch(
        setTambahPegawaiData({
          data: [],
          links: [],
          current_page: 1,
          last_page: 1,
        })
      );
    } finally {
      dispatch(setTambahPegawaiLoading(false));
    }
  };

// Tambah pegawai ke unit detail
export const addPegawaiToUnitDetail =
  (unit_detail_id, pegawai_ids, onSuccess) => async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/unit-detail/add-pegawai-to-unit-detail`,
        { unit_detail_id, pegawai_ids },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        icon: "success",
        title: "Pegawai berhasil ditambahkan ke unit detail",
        timer: 1200,
        showConfirmButton: false,
      });
      if (onSuccess) onSuccess();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal menambah pegawai ke unit detail",
      });
    }
  };
