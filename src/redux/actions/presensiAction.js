import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  setEventHistory,
  setEventHistoryLoading,
  setEventHistoryError,
  setEventRekapPegawai,
  setEventRekapPegawaiLoading,
  setEventRekapPegawaiError,
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
  (pegawai_id, tahun, unit_id = null) => async (dispatch, getState) => {
    dispatch(setDetailRekapLoading(true));
    dispatch(setDetailRekapError(null));
    const { token } = getState().auth;
    try {
      const unitParam = unit_id ? `&unit_id=${unit_id}` : "";
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/api/presensi/rekap-bulanan-pegawai?pegawai_id=${pegawai_id}&tahun=${tahun}${unitParam}`,
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
  (mount, year, filterUnit, isSuperAdmin, unitId = null) => async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      let unitParam = "";
      if (unitId) {
        unitParam = `&unit_id=${unitId}`;
      } else if (isSuperAdmin && filterUnit) {
        unitParam = `&unit_id=${filterUnit}`;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/presensi/overtime?bulan=${mount}&tahun=${year}${unitParam}`,
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
  (pegawai_id, bulan, tahun, unit_id = null) => async (dispatch, getState) => {
    dispatch(setLaporanKehadiranLoading(true));
    dispatch(setLaporanKehadiranError(null));
    const { token } = getState().auth;
    try {
      const unitParam = unit_id ? `&unit_id=${unit_id}` : "";
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/api/presensi/laporan-kehadiran-karyawan/${pegawai_id}?bulan=${bulan}&tahun=${tahun}${unitParam}`,
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

export const fetchHistoryPresensiEvent = (unit_id, tipe_event, tanggal, events_id) => async (dispatch, getState) => {
  const { token } = getState().auth;
  dispatch(setEventHistoryLoading(true));
  dispatch(setEventHistoryError(null));
  try {
    const params = new URLSearchParams();
    if (unit_id) params.append("unit_id", unit_id);
    if (tipe_event) params.append("tipe_event", tipe_event);
    if (tanggal) params.append("tanggal", tanggal);
    if (events_id) params.append("events_id", events_id);
    const query = params.toString();
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/events/history-presensi-event${query ? `?${query}` : ""}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch(setEventHistory(Array.isArray(response.data) ? response.data : []));
    dispatch(setEventHistoryLoading(false));
  } catch (error) {
    dispatch(setEventHistoryLoading(false));
    dispatch(setEventHistoryError(error.response?.data?.message ?? "Gagal mengambil history presensi event"));
    dispatch(setEventHistory([]));
  }
};

export const fetchRekapPresensiEventPegawai = (unit_id, pegawai_id, events_id, tanggal_mulai, tanggal_selesai) => async (dispatch, getState) => {
  const { token } = getState().auth;
  dispatch(setEventRekapPegawaiLoading(true));
  dispatch(setEventRekapPegawaiError(null));
  try {
    const params = new URLSearchParams();
    if (unit_id) params.append("unit_id", unit_id);
    if (pegawai_id) params.append("pegawai_id", pegawai_id);
    if (events_id) params.append("events_id", events_id);
    if (tanggal_mulai) params.append("tanggal_mulai", tanggal_mulai);
    if (tanggal_selesai) params.append("tanggal_selesai", tanggal_selesai);
    const query = params.toString();
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/events/rekap-presensi-event-pegawai${query ? `?${query}` : ""}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    dispatch(setEventRekapPegawai(response.data));
    dispatch(setEventRekapPegawaiLoading(false));
  } catch (error) {
    dispatch(setEventRekapPegawaiLoading(false));
    dispatch(setEventRekapPegawaiError(error.response?.data?.message ?? "Gagal mengambil rekap presensi event pegawai"));
    dispatch(setEventRekapPegawai(null));
  }
};

export const downloadRekapPresensiEventPegawai = (unit_id, pegawai_id, events_id, tanggal_mulai, tanggal_selesai) => async (dispatch, getState) => {
  const { token } = getState().auth;
  try {
    const params = new URLSearchParams();
    if (unit_id) params.append("unit_id", unit_id);
    if (pegawai_id) params.append("pegawai_id", pegawai_id);
    if (events_id) params.append("events_id", events_id);
    if (tanggal_mulai) params.append("tanggal_mulai", tanggal_mulai);
    if (tanggal_selesai) params.append("tanggal_selesai", tanggal_selesai);
    const query = params.toString();
    
    const dataResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/events/rekap-presensi-event-pegawai${query ? `?${query}` : ""}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = dataResponse.data;
    
    if (!data) {
      return { success: false, message: "Data tidak tersedia" };
    }
    
    const doc = new jsPDF("p", "mm", "a4");
    doc.setFontSize(16);
    doc.text("REKAP PRESENSI EVENT", 105, 20, { align: "center" });
    
    if (data.pegawai) {
      doc.setFontSize(12);
      doc.text(`Nama: ${data.pegawai.nama || "-"}`, 14, 35);
      doc.text(`NIK: ${data.pegawai.no_ktp || "-"}`, 14, 42);
    }
    
    // Info Periode
    if (data.periode) {
      doc.setFontSize(12);
      doc.text(`Periode: ${data.periode.tanggal_mulai || "-"} s/d ${data.periode.tanggal_selesai || "-"}`, 14, 49);
    }
    
    if (data.events && Array.isArray(data.events) && data.events.length > 0) {
      const headers = ["No", "Nama Event", "Jml. Event", "Jml. Hadir", "Jml. Tidak Hadir", "Prosentase Hadir", "Prosentase Tidak Hadir"];
      const eventRows = data.events.map((event, idx) => [
        idx + 1,
        event.nama_event || "-",
        event.total_event_berlangsung || 0,
        event.total_hadir || 0,
        event.total_tidak_hadir || 0,
        `${event.persentase_hadir ?? 0}%`,
        `${event.persentase_tidak_hadir ?? 0}%`,
      ]);
      const summaryRow = data.summary
        ? [
            "-",
            "SUMMARY",
            data.summary.total_event_berlangsung || 0,
            data.summary.total_hadir || 0,
            data.summary.total_tidak_hadir || 0,
            `${data.summary.persentase_hadir ?? 0}%`,
            `${data.summary.persentase_tidak_hadir ?? 0}%`,
          ]
        : null;
      const body = summaryRow ? [...eventRows, summaryRow] : eventRows;

      autoTable(doc, {
        startY: 56,
        head: [headers],
        body,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: {
          fillColor: [5, 150, 105],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { halign: "center" },
          2: { halign: "center" },
          3: { halign: "center" },
          4: { halign: "center" },
          5: { halign: "center" },
          6: { halign: "center" },
        },
        didParseCell: (data) => {
          if (data.section === "body" && data.row.index === body.length - 1 && summaryRow) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [209, 250, 229];
          }
        },
      });
    }
    
    const pegawaiName = data.pegawai?.nama?.replace(/[^a-zA-Z0-9]/g, "_") || "pegawai";
    const fileName = `Rekap Presensi Event - ${pegawaiName} - ${tanggal_mulai || "all"}.pdf`;
    doc.save(fileName);
    
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.message ?? "Gagal mengunduh rekap presensi event pegawai" };
  }
};

