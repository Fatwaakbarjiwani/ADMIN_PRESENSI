import axios from "axios";
import {
  setData,
  setError,
  setLoading,
  setRekapLoading,
  setRekapError,
  setRekapData,
  setDetailRekapLoading,
  setDetailRekapError,
  setDetailRekap,
  setDetailHistory,
  setDetailHistoryLoading,
  setDetailHistoryError,
  setDinasLoading,
  setDinasData,
  setLemburData,
  setLaporanKehadiran,
  setLaporanKehadiranLoading,
  setLaporanKehadiranError,
  setEvent,
  setEventDetail,
  setEventDetailLoading,
  setEventDetailError,
  setEventPegawai,
  setEventPegawaiLoading,
  setEventPegawaiError,
} from "../reducers/presensiReducer";

export const fetchPresensiHistoryByUnit =
  (date) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    const { token } = getState().auth;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/presensi/history-by-unit?tanggal=${date || ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setData(response.data));
      dispatch(setLoading(false));
    } catch {
      dispatch(setLoading(false));
      dispatch(setError("Gagal mengambil data presensi"));
    }
  };

export const fetchPresensiRekapByUnit =
  (tanggal) => async (dispatch, getState) => {
    dispatch(setRekapLoading(true));
    dispatch(setRekapError(null));
    const { token } = getState().auth;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/presensi/rekap-by-unit?${tanggal ? `tanggal=${tanggal}` : ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setRekapData(response.data));
      dispatch(setRekapLoading(false));
    } catch {
      dispatch(setRekapLoading(false));
      dispatch(setRekapError("Gagal mengambil data rekap presensi"));
    }
  };

export const fetchPresensiRekapBulananPegawai =
  (pegawai_id, tahun) => async (dispatch, getState) => {
    dispatch(setDetailRekapLoading(true));
    dispatch(setDetailRekapError(null));
    const { token } = getState().auth;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/api/presensi/rekap-bulanan-pegawai?pegawai_id=${pegawai_id}&tahun=${tahun}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setDetailRekap(response.data));
      dispatch(setDetailRekapLoading(false));
    } catch {
      dispatch(setDetailRekapLoading(false));
      dispatch(
        setDetailRekapError("Gagal mengambil detail rekap bulanan pegawai")
      );
    }
  };

export const fetchPresensiDetailHistoryByUnit =
  (pegawai_id, from, to, unit_id, isSuperAdmin) =>
    async (dispatch, getState) => {
      dispatch(setDetailHistoryLoading(true));
      dispatch(setDetailHistoryError(null));
      const { token } = getState().auth;
      try {
        // Default: from hari ini, to satu tahun setelahnya jika tidak diisi
        const today = new Date();
        const defaultFrom = from || today.toISOString().slice(0, 10);
        const nextYear = new Date(today);
        nextYear.setFullYear(today.getFullYear() + 1);
        const defaultTo = to || nextYear.toISOString().slice(0, 10);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL
          }/api/presensi/detail-history-by-unit?pegawai_id=${pegawai_id}${isSuperAdmin ? `&unit_id=${unit_id}` : ""
          }&from=${defaultFrom}&to=${defaultTo}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        dispatch(setDetailHistory(response.data));
        dispatch(setDetailHistoryLoading(false));
      } catch {
        dispatch(setDetailHistoryLoading(false));
        dispatch(
          setDetailHistoryError("Gagal mengambil detail history presensi")
        );
      }
    };

// Fetch data dinas
export const fetchDinasData =
  (params = "") =>
    async (dispatch, getState) => {
      dispatch(setDinasLoading(true));
      const { token } = getState().auth;
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/dinas/get-all${params ? `?${params}` : ""
          }`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response && response.data) {
          dispatch(setDinasData(response.data));
        }
      } catch (error) {
        if (error) {
          dispatch(setDinasLoading(false));
        }
      } finally {
        dispatch(setDinasLoading(false));
      }
    };

export const fetchLembur =
  (mount, year, filterUnit, isSuperAdmin) => async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/api/presensi/overtime?bulan=${mount}&tahun=${year}${isSuperAdmin ? `?unit_id=${filterUnit}` : ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(setLemburData(response.data));
    } catch (error) {
      if (error) {
        return;
      }
    }
  };

export const fetchLaporanKehadiranPegawai =
  (pegawai_id, bulan, tahun) => async (dispatch, getState) => {
    dispatch(setLaporanKehadiranLoading(true));
    dispatch(setLaporanKehadiranError(null));
    const { token } = getState().auth;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/api/presensi/laporan-kehadiran-karyawan/${pegawai_id}?bulan=${bulan}&tahun=${tahun}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setLaporanKehadiran(response.data));
      dispatch(setLaporanKehadiranLoading(false));
    } catch (error) {
      dispatch(setLaporanKehadiranLoading(false));
      dispatch(
        setLaporanKehadiranError("Gagal mengambil data laporan kehadiran")
      );
      if (error) {
        return error.response.data;
      }
    }
  };

export const fetchEvent = (search = "", unit_id = null, isSuperAdmin, active = null) => async (dispatch, getState) => {
  const { token } = getState().auth;
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search.trim());
    if (active != null) params.append("is_active", active);
    if (isSuperAdmin && unit_id) params.append("unit_id", unit_id);
    const query = params.toString();
    const url = `${import.meta.env.VITE_API_URL}/api/events/get-all-by-unit${query ? `?${query}` : ""}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(setEvent(response.data?.data ?? response.data ?? []));
  } catch (error) {
    dispatch(setEvent([]));
    return error.response?.data;
  }
};

export const fetchEventDetail = (id) => async (dispatch, getState) => {
  const { token } = getState().auth;
  dispatch(setEventDetailLoading(true));
  dispatch(setEventDetailError(null));
  dispatch(setEventDetail(null));
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/events/get-by-id/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch(setEventDetail(response.data));
    dispatch(setEventDetailLoading(false));
  } catch (error) {
    dispatch(setEventDetailLoading(false));
    dispatch(setEventDetailError(error.response?.data?.message ?? "Gagal mengambil detail event"));
  }
};

export const fetchPegawaiByEvent = (eventId) => async (dispatch, getState) => {
  const { token } = getState().auth;
  dispatch(setEventPegawaiLoading(true));
  dispatch(setEventPegawaiError(null));
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/events/get-pegawai-events/${eventId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const body = response.data;
    const data = body?.data ?? (Array.isArray(body) ? body : []);
    dispatch(setEventPegawai(Array.isArray(data) ? data : []));
    dispatch(setEventPegawaiLoading(false));
  } catch (error) {
    dispatch(setEventPegawaiLoading(false));
    dispatch(setEventPegawaiError(error.response?.data?.message ?? "Gagal mengambil pegawai event"));
    dispatch(setEventPegawai([]));
  }
};

export const createEvent = (payload, isSuperAdmin, unitId = null) => async (dispatch, getState) => {
  const { token } = getState().auth;
  const body = { ...payload };
  if (isSuperAdmin && unitId) body.unit_id = unitId;
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/events/create`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.message ?? "Gagal membuat event" };
  }
};

export const updateEvent = (id, payload, isSuperAdmin, unitId = null) => async (dispatch, getState) => {
  const { token } = getState().auth;
  const body = { ...payload };
  if (isSuperAdmin && unitId) body.unit_id = unitId;
  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/events/update/${id}`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.message ?? "Gagal mengupdate event" };
  }
};

export const addPegawaiToEvent = (events_id, pegawai_ids) => async (dispatch, getState) => {
  const { token } = getState().auth;
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/events/add-pegawai-to-event`,
      { events_id: Number(events_id), pegawai_ids: pegawai_ids.map((id) => Number(id)) },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.message ?? "Gagal menambah pegawai ke event" };
  }
};

export const removePegawaiFromEvent = (events_id, pegawai_ids) => async (dispatch, getState) => {
  const { token } = getState().auth;
  try {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/events/remove-pegawai-from-event`,
      {
        data: { events_id: Number(events_id), pegawai_ids: pegawai_ids.map((id) => Number(id)) },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.message ?? "Gagal menghapus pegawai dari event" };
  }
};
