import { Fragment, useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchEvent, fetchHistoryPresensiEvent, fetchRekapPresensiEventPegawai, downloadRekapPresensiEventPegawai } from "../../redux/actions/presensiAction";
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";
import { fetchPegawai2 } from "../../redux/actions/pegawaiAction";
import Swal from "sweetalert2";

function Event() {
  const event = useSelector((state) => state.presensi.event);
  const eventHistory = useSelector((state) => state.presensi.eventHistory);
  const eventHistoryLoading = useSelector((state) => state.presensi.eventHistoryLoading);
  const eventHistoryError = useSelector((state) => state.presensi.eventHistoryError);
  const eventRekapPegawai = useSelector((state) => state.presensi.eventRekapPegawai);
  const eventRekapPegawaiLoading = useSelector((state) => state.presensi.eventRekapPegawaiLoading);
  const eventRekapPegawaiError = useSelector((state) => state.presensi.eventRekapPegawaiError);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const units = useSelector((state) => state.unitDetail.units);
  const pegawaiDataRaw = useSelector((state) => state.pegawai.data);
  const isSuperAdmin = user?.role === "super_admin";

  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem("eventTab");
    return savedTab || "management";
  });

  const [selectedUnit, setSelectedUnit] = useState(location.state?.unit_id || "");
  const [search, setSearch] = useState("");

  const [historyEventId, setHistoryEventId] = useState("");
  const [historyTanggal, setHistoryTanggal] = useState("");
  const [historyTipeEvent, setHistoryTipeEvent] = useState("");

  const [rekapPegawaiId, setRekapPegawaiId] = useState("");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [rekapTanggalMulai, setRekapTanggalMulai] = useState("");
  const [rekapTanggalSelesai, setRekapTanggalSelesai] = useState("");
  const [searchPegawai, setSearchPegawai] = useState("");

  useEffect(() => {
    localStorage.setItem("eventTab", tab);
  }, [tab]);

  useEffect(() => {
    if (isSuperAdmin) {
      dispatch(fetchAllUnit());
    }
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) {
      dispatch(fetchEvent(search, null, false, null));
      return;
    }
    if (selectedUnit) {
      dispatch(fetchEvent(search, selectedUnit, true, null));
    }
  }, [dispatch, isSuperAdmin, selectedUnit, search]);

  useEffect(() => {
    if (tab === "management" && token) {
      if (!isSuperAdmin) {
        dispatch(fetchEvent(search, null, false, null));
      } else if (selectedUnit) {
        dispatch(fetchEvent(search, selectedUnit, true, null));
      }
    }
  }, [tab, dispatch, token, isSuperAdmin, selectedUnit, search]);

  useEffect(() => {
    if (tab === "rekap" && token) {
      if (isSuperAdmin && selectedUnit) {
        dispatch(fetchPegawai2(isSuperAdmin, token, 1, searchPegawai, selectedUnit));
      } else if (!isSuperAdmin) {
        dispatch(fetchPegawai2(isSuperAdmin, token, 1, searchPegawai, null));
      }
    }
  }, [tab, isSuperAdmin, selectedUnit, searchPegawai, dispatch, token]);

  const eventList = Array.isArray(event) ? event : [];

  const unitsFlat = Array.isArray(units) ? units : [];
  const getParentId = (u) => {
    const id = u.parent_id ?? u.id_parent ?? u.parent;
    return id === undefined || id === null ? "root" : id;
  };
  const childrenByParent = unitsFlat.reduce((acc, u) => {
    const pid = getParentId(u);
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(u);
    return acc;
  }, {});
  const buildOrdered = (parentKey, depth) => {
    const list = [];
    (childrenByParent[parentKey] || []).forEach((unit) => {
      list.push({ ...unit, depth });
      list.push(...buildOrdered(unit.id, depth + 1));
    });
    return list;
  };
  const unitsHierarchy = buildOrdered("root", 0);

  const indentLabel = (depth, nama) => {
    const d = depth || 0;
    const space = "\u00A0".repeat(d * 3);
    const prefix = d > 0 ? "›\u00A0" : "";
    return `${space}${prefix}${nama}`;
  };

  const formatTime = (t) => {
    if (!t) return "-";
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatEventTime = (event) => {
    if (event.tipe_event === "Sholat Fardhu") {
      const waktuMulai = formatTime(event.waktu_mulai);
      const waktuSelesai = formatTime(event.waktu_selesai);
      if (waktuMulai === "-" && waktuSelesai === "-") return "-";
      return `${waktuMulai} - ${waktuSelesai}`;
    } else if (event.tipe_event === "Event & Kegiatan Islam") {
      const tanggalMulai = formatDate(event.tanggal_mulai);
      const tanggalSelesai = formatDate(event.tanggal_selesai);
      const waktuMasukMulai = formatTime(event.waktu_masuk_mulai);
      const waktuMasukSelesai = formatTime(event.waktu_masuk_selesai);
      const waktuPulangMulai = formatTime(event.waktu_pulang_mulai);
      const waktuPulangSelesai = formatTime(event.waktu_pulang_selesai);
      
      let result = "";
      if (tanggalMulai !== "-" && tanggalSelesai !== "-") {
        if (tanggalMulai === tanggalSelesai) {
          result = tanggalMulai;
        } else {
          result = `${tanggalMulai} - ${tanggalSelesai}`;
        }
      }
      
      if (waktuMasukMulai !== "-" && waktuMasukSelesai !== "-") {
        result += result ? `\nMasuk: ${waktuMasukMulai} - ${waktuMasukSelesai}` : `Masuk: ${waktuMasukMulai} - ${waktuMasukSelesai}`;
      }
      
      if (waktuPulangMulai !== "-" && waktuPulangSelesai !== "-") {
        result += result ? `\nPulang: ${waktuPulangMulai} - ${waktuPulangSelesai}` : `Pulang: ${waktuPulangMulai} - ${waktuPulangSelesai}`;
      }
      
      return result || "-";
    }
    return "-";
  };

  const handleTambahEvent = () => {
    navigate("/event/tambah", { state: isSuperAdmin ? { unitId: selectedUnit } : {} });
  };

  const filteredPegawai = useMemo(() => {
    const data = Array.isArray(pegawaiDataRaw) ? pegawaiDataRaw : [];
    if (!searchPegawai) return data.slice(0, 10);
    const searchLower = searchPegawai.toLowerCase();
    return data
      .filter((p) => {
        const nama = (p.nama || "").toLowerCase();
        const nik = (p.no_ktp || "").toLowerCase();
        return nama.includes(searchLower) || nik.includes(searchLower);
      })
      .slice(0, 10);
  }, [pegawaiDataRaw, searchPegawai]);

  const handleFetchHistory = () => {
    if (!historyEventId || !historyTanggal || !historyTipeEvent) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Harap lengkapi semua filter (Event, Tanggal, Tipe Event)",
      });
      return;
    }

    const unitId = isSuperAdmin ? selectedUnit : (user?.unit_id || user?.ms_unit_id || "");
    dispatch(fetchHistoryPresensiEvent(unitId, historyTipeEvent, historyTanggal, historyEventId));
  };

  const handleFetchRekap = () => {
    if (!rekapPegawaiId || !rekapTanggalMulai || !rekapTanggalSelesai || selectedEvents.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Harap lengkapi semua filter (Pegawai, Tanggal Mulai, Tanggal Selesai, dan pilih minimal 1 Event)",
      });
      return;
    }

    const unitId = isSuperAdmin ? selectedUnit : (user?.unit_id || user?.ms_unit_id || "");
    const eventsIdStr = selectedEvents.join(",");
    dispatch(fetchRekapPresensiEventPegawai(unitId, rekapPegawaiId, eventsIdStr, rekapTanggalMulai, rekapTanggalSelesai));
  };

  const handleToggleEvent = (eventId) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const handleSelectAllEvents = () => {
    if (selectedEvents.length === eventList.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(eventList.map((e) => e.id));
    }
  };

  const handleDownloadRekap = async () => {
    if (!rekapPegawaiId || !rekapTanggalMulai || !rekapTanggalSelesai || selectedEvents.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Harap lengkapi semua filter dan pilih minimal 1 Event",
      });
      return;
    }

    const unitId = isSuperAdmin ? selectedUnit : (user?.unit_id || user?.ms_unit_id || "");
    const eventsIdStr = selectedEvents.join(",");
    const result = await dispatch(
      downloadRekapPresensiEventPegawai(unitId, rekapPegawaiId, eventsIdStr, rekapTanggalMulai, rekapTanggalSelesai)
    );

    if (result?.success) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Rekap presensi event berhasil diunduh",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: result?.message || "Gagal mengunduh rekap presensi event",
      });
    }
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white text-lg">event</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Manajemen Event
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Kelola data event presensi
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-full flex flex-col gap-6">
        <div className="bg-white">
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "management"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("management")}
            >
              <span className="material-icons text-base">event_note</span>
              Manajemen Event
            </button>
            <button
              className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "rekap"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("rekap")}
            >
              <span className="material-icons text-base">assessment</span>
              Rekap dan History
            </button>
          </div>

          {tab === "management" && (
            <>
              <div className="bg-white border-2 border-emerald-200 shadow-lg">
                <div className="bg-emerald-50 px-4 py-3 border-b-2 border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-600 p-2">
                      <span className="material-icons text-white text-sm">filter_list</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">
                        Filter & Pencarian
                      </h3>
                      <p className="text-xs text-emerald-600">
                        Atur filter dan cari data event
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleTambahEvent}
                        disabled={isSuperAdmin && !selectedUnit}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs border-2 border-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1"
                      >
                        <span className="material-icons text-sm">add</span>
                        Tambah Event
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                      {isSuperAdmin && (
                        <div className="flex flex-col min-w-[200px]">
                          <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                            Unit
                          </label>
                          <select
                            className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                          >
                            <option value="">Pilih Unit</option>
                            {unitsHierarchy.map((unit) => {
                              const depth = unit.depth ?? 0;
                              const nama = unit?.nama ?? unit?.name ?? unit.id;
                              return (
                                <option key={unit.id} value={unit.id}>
                                  {indentLabel(depth, nama)}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                      <div className="flex flex-col min-w-[200px]">
                        <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                          Cari
                        </label>
                        <input
                          type="text"
                          placeholder="Cari event..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white placeholder-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isSuperAdmin && !selectedUnit && (
                <div className="bg-white border-2 border-emerald-200 shadow-lg">
                  <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2">
                        <span className="material-icons text-lg text-emerald-600">visibility</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wide">
                          Pilih Unit
                        </h2>
                        <p className="text-emerald-100 text-xs font-medium">
                          Pilih unit untuk menampilkan data event
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center">
                      <span className="material-icons text-emerald-600 text-3xl">event</span>
                    </div>
                    <p className="text-emerald-700 font-medium text-center">
                      Silakan pilih unit terlebih dahulu untuk menampilkan data event
                    </p>
                  </div>
                </div>
              )}

              {(user?.role !== "super_admin" || (user?.role === "super_admin" && selectedUnit)) && (
                <div className="bg-white border-2 border-emerald-200 shadow-lg">
                  <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2">
                        <span className="material-icons text-lg text-emerald-600">event_note</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wide">
                          Data Event
                        </h2>
                        <p className="text-emerald-100 text-xs font-medium">
                          Daftar semua data event
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-b-2 border-emerald-200 bg-emerald-50">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <span className="material-icons text-emerald-600">description</span>
                      <span className="font-bold text-sm">Total Data: {eventList.length} records</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto border-2 border-emerald-200">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-emerald-600">
                          <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                            NO
                          </th>
                          <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                            NAMA EVENT
                          </th>
                          <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                            DESKRIPSI
                          </th>
                          <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                            TIPE
                          </th>
                          <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                            WAKTU
                          </th>
                          <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                            TEMPAT
                          </th>
                          <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                            STATUS
                          </th>
                          <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider">
                            AKSI
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                              Tidak ada data event
                            </td>
                          </tr>
                        ) : (
                          eventList.map((row, idx) => (
                            <tr
                              key={row.id}
                              className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                                idx % 2 === 0 ? "bg-white" : "bg-emerald-50/50"
                              }`}
                            >
                              <td className="px-3 py-2 text-center text-sm font-semibold text-emerald-900">
                                {idx + 1}
                              </td>
                              <td className="px-3 py-2 text-center text-sm font-bold text-emerald-900">
                                {row.nama_event ?? row.nama ?? "-"}
                              </td>
                              <td className="px-3 py-2 text-center text-sm max-w-xs truncate text-emerald-900">
                                {row.deskripsi ?? "-"}
                              </td>
                              <td className="px-3 py-2 text-center text-sm text-emerald-900">
                                {row.tipe_event ?? "-"}
                              </td>
                              <td className="px-3 py-2 text-center text-sm text-emerald-900">
                                <div className="whitespace-pre-line text-left">
                                  {formatEventTime(row)}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center text-sm text-emerald-900">
                                {row.nama_tempat ?? "-"}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`inline-flex items-center px-2 py-1 text-xs font-bold border ${
                                    row.is_active
                                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                      : "bg-gray-100 text-gray-600 border-gray-300"
                                  }`}
                                >
                                  {row.is_active ? "Aktif" : "Nonaktif"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <div className="flex justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/event/${row.id}`)}
                                    className="w-8 h-8 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 hover:border-emerald-300 transition-all duration-200"
                                    title="Lihat detail"
                                  >
                                    <span className="material-icons text-sm">visibility</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/event/${row.id}/edit`)}
                                    className="w-8 h-8 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200 hover:border-amber-300 transition-all duration-200"
                                    title="Edit event"
                                  >
                                    <span className="material-icons text-sm">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/event/${row.id}/pegawai`)}
                                    className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200 hover:border-blue-300 transition-all duration-200"
                                    title="Tambah pegawai ke event"
                                  >
                                    <span className="material-icons text-sm">group_add</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "rekap" && (
            <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
              <div className="bg-emerald-600 px-6 py-4 border-b-2 border-emerald-700">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2">
                    <span className="material-icons text-xl text-white">assessment</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                      Rekap & History Presensi Event
                    </h2>
                    <p className="text-emerald-100 text-sm font-medium mt-0.5">
                      Cek history hadir per event dan rekap presensi pegawai
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-8">
                <div className="bg-white border-2 border-emerald-200 overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-5 py-3.5 border-b-2 border-emerald-200">
                    <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                      <span className="material-icons text-emerald-600 text-lg">history</span>
                      History Presensi Event
                    </h3>
                    <p className="text-emerald-600 text-xs mt-1">Lihat daftar pegawai yang hadir pada event di tanggal tertentu</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {isSuperAdmin && (
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                            Unit
                          </label>
                          <select
                            className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                          >
                            <option value="">Pilih Unit</option>
                            {unitsHierarchy.map((unit) => {
                              const depth = unit.depth ?? 0;
                              const nama = unit?.nama ?? unit?.name ?? unit.id;
                              return (
                                <option key={unit.id} value={unit.id}>
                                  {indentLabel(depth, nama)}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                          Event
                        </label>
                        <select
                          className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                          value={historyEventId}
                          onChange={(e) => setHistoryEventId(e.target.value)}
                          disabled={isSuperAdmin && !selectedUnit}
                        >
                          <option value="">Pilih Event</option>
                          {eventList.map((evt) => (
                            <option key={evt.id} value={evt.id}>
                              {evt.nama_event || evt.nama || "-"}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                          Tipe Event
                        </label>
                        <select
                          className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                          value={historyTipeEvent}
                          onChange={(e) => setHistoryTipeEvent(e.target.value)}
                        >
                          <option value="">Pilih Tipe</option>
                          <option value="Sholat Fardhu">Sholat Fardhu</option>
                          <option value="Event & Kegiatan Islam">Event & Kegiatan Islam</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                          Tanggal
                        </label>
                        <input
                          type="date"
                          className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                          value={historyTanggal}
                          onChange={(e) => setHistoryTanggal(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleFetchHistory}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <span className="material-icons text-lg">search</span>
                        Cari History
                      </button>
                    </div>

                    {eventHistoryLoading && (
                      <div className="text-center py-4 text-emerald-600">Memuat data...</div>
                    )}
                    {eventHistoryError && (
                      <div className="text-center py-4 text-red-600">{eventHistoryError}</div>
                    )}
                    {!eventHistoryLoading && !eventHistoryError && eventHistory.length > 0 && (
                      <div className="overflow-x-auto border-2 border-emerald-200 mt-4">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-emerald-600">
                              <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                                NO
                              </th>
                              <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                                NIK
                              </th>
                              <th className="px-3 py-2.5 text-left font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                                NAMA PEGAWAI
                              </th>
                              <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                                UNIT KERJA
                              </th>
                              <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                                STATUS PRESENSI
                              </th>
                              {historyTipeEvent === "Event & Kegiatan Islam" && (
                                <>
                                  <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                                    STATUS MASUK
                                  </th>
                                  <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500">
                                    STATUS PULANG
                                  </th>
                                </>
                              )}
                              <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider">
                                JAM
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {eventHistory.map((item, idx) => (
                              <tr
                                key={idx}
                                className={`border-b border-emerald-100 ${
                                  idx % 2 === 0 ? "bg-white" : "bg-emerald-50/50"
                                }`}
                              >
                                <td className="px-3 py-2 text-center text-emerald-900">{idx + 1}</td>
                                <td className="px-3 py-2 text-center text-emerald-900">{item.no_ktp || "-"}</td>
                                <td className="px-3 py-2 text-emerald-900 font-medium">{item.nama_pegawai || "-"}</td>
                                <td className="px-3 py-2 text-center text-emerald-900">{item.unit_kerja || item.nama_unit || "-"}</td>
                                <td className="px-3 py-2 text-center text-emerald-900">{item.status_presensi || "-"}</td>
                                {historyTipeEvent === "Event & Kegiatan Islam" && (
                                  <>
                                    <td className="px-3 py-2 text-center text-emerald-900">{item.status_masuk || "-"}</td>
                                    <td className="px-3 py-2 text-center text-emerald-900">{item.status_pulang || "-"}</td>
                                  </>
                                )}
                                <td className="px-3 py-2 text-center text-emerald-900">{item.jam || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border-2 border-emerald-200 overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-5 py-3.5 border-b-2 border-emerald-200">
                    <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                      <span className="material-icons text-emerald-600 text-lg">assessment</span>
                      Rekap Presensi Event
                    </h3>
                    <p className="text-emerald-600 text-xs mt-1">Rekap kehadiran pegawai per event dalam periode tertentu</p>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {isSuperAdmin && (
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                            Unit
                          </label>
                          <select
                            className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                          >
                            <option value="">Pilih Unit</option>
                            {unitsHierarchy.map((unit) => {
                              const depth = unit.depth ?? 0;
                              const nama = unit?.nama ?? unit?.name ?? unit.id;
                              return (
                                <option key={unit.id} value={unit.id}>
                                  {indentLabel(depth, nama)}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                      <div className="flex flex-col relative">
                        <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                          Pegawai
                        </label>
                        <input
                          type="text"
                          placeholder="Cari pegawai..."
                          value={searchPegawai}
                          onChange={(e) => setSearchPegawai(e.target.value)}
                          className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white placeholder-gray-500"
                        />
                        {searchPegawai && filteredPegawai.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-emerald-200 shadow-lg max-h-60 overflow-y-auto">
                            {filteredPegawai.map((p) => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  setRekapPegawaiId(p.id);
                                  setSearchPegawai(p.nama || "");
                                }}
                                className="px-3 py-2 hover:bg-emerald-50 cursor-pointer border-b border-emerald-100"
                              >
                                <div className="font-semibold text-sm">{p.nama || "-"}</div>
                                <div className="text-xs text-gray-500">{p.no_ktp || "-"}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {rekapPegawaiId && (
                          <div className="mt-1 text-xs text-emerald-600">
                            Selected: {filteredPegawai.find((p) => p.id === rekapPegawaiId)?.nama || "-"}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                          Tanggal Mulai
                        </label>
                        <input
                          type="date"
                          className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                          value={rekapTanggalMulai}
                          onChange={(e) => setRekapTanggalMulai(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                          Tanggal Selesai
                        </label>
                        <input
                          type="date"
                          className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                          value={rekapTanggalSelesai}
                          onChange={(e) => setRekapTanggalSelesai(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 border-2 border-emerald-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                          <span className="material-icons text-emerald-600 text-base">event_available</span>
                          Pilih Event
                        </label>
                        <button
                          type="button"
                          onClick={handleSelectAllEvents}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-2 py-1 hover:bg-emerald-100 transition"
                        >
                          {selectedEvents.length === eventList.length ? "Batal Pilih Semua" : "Pilih Semua"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                        {eventList.map((evt) => (
                          <label
                            key={evt.id}
                            className="flex items-center gap-2 p-2 border border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedEvents.includes(evt.id)}
                              onChange={() => handleToggleEvent(evt.id)}
                              className="w-4 h-4 text-emerald-600 border-emerald-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm">{evt.nama_event || evt.nama || "-"}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleFetchRekap}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <span className="material-icons text-lg">search</span>
                        Cari Rekap
                      </button>
                    </div>

                    {eventRekapPegawaiLoading && (
                      <div className="text-center py-4 text-emerald-600">Memuat data...</div>
                    )}
                    {eventRekapPegawaiError && (
                      <div className="text-center py-4 text-red-600">{eventRekapPegawaiError}</div>
                    )}
                    {!eventRekapPegawaiLoading && !eventRekapPegawaiError && eventRekapPegawai && (
                      <div className="space-y-4 mt-4">
                        {eventRekapPegawai.pegawai && (
                          <div className="bg-emerald-50 p-4 border-2 border-emerald-200 flex items-start gap-3">
                            <span className="material-icons text-emerald-600 text-2xl">person</span>
                            <div>
                              <h4 className="font-bold text-emerald-800 mb-2">Informasi Pegawai</h4>
                            <p className="text-sm">
                              <span className="font-semibold">Nama:</span> {eventRekapPegawai.pegawai.nama || "-"}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">NIK:</span> {eventRekapPegawai.pegawai.no_ktp || "-"}
                            </p>
                            </div>
                          </div>
                        )}

                        {eventRekapPegawai.periode && (
                          <div className="bg-emerald-50 p-4 border-2 border-emerald-200 flex items-start gap-3">
                            <span className="material-icons text-emerald-600 text-2xl">date_range</span>
                            <div>
                            <h4 className="font-bold text-emerald-800 mb-2">Periode</h4>
                            <p className="text-sm">
                              {eventRekapPegawai.periode.tanggal_mulai || "-"} s/d{" "}
                              {eventRekapPegawai.periode.tanggal_selesai || "-"}
                            </p>
                            </div>
                          </div>
                        )}

                        {eventRekapPegawai.events && eventRekapPegawai.events.length > 0 && (
                          <div className="overflow-x-auto border-2 border-emerald-200 mt-4">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr className="bg-emerald-600">
                                  <th rowSpan={2} className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500 w-12">
                                    NO
                                  </th>
                                  <th rowSpan={2} className="px-3 py-2.5 text-left font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500 min-w-[100px]">
                                    NIK
                                  </th>
                                  <th rowSpan={2} className="px-3 py-2.5 text-left font-bold text-white text-xs uppercase tracking-wider border-r border-emerald-500 min-w-[180px]">
                                    NAMA PEGAWAI
                                  </th>
                                  {eventRekapPegawai.events.map((evt, idx) => (
                                    <th
                                      key={idx}
                                      colSpan={5}
                                      className="px-2 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider border-r border-b border-emerald-500"
                                    >
                                      {evt.nama_event || "-"}
                                    </th>
                                  ))}
                                  <th
                                    colSpan={5}
                                    className="px-2 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider"
                                  >
                                    SUMMARY
                                  </th>
                                </tr>
                                <tr className="bg-emerald-600">
                                  {eventRekapPegawai.events.map((evt, idx) => (
                                    <Fragment key={idx}>
                                      <th className="px-2 py-2 text-center font-bold text-white text-[10px] uppercase tracking-wider border-r border-emerald-500">
                                        JML. EVENT
                                      </th>
                                      <th className="px-2 py-2 text-center font-bold text-white text-[10px] uppercase tracking-wider border-r border-emerald-500">
                                        JML. HADIR
                                      </th>
                                      <th className="px-2 py-2 text-center font-bold text-white text-[10px] uppercase tracking-wider border-r border-emerald-500">
                                        JML. TIDAK HADIR
                                      </th>
                                      <th className="px-2 py-2 text-center font-bold text-white text-[10px] uppercase tracking-wider border-r border-emerald-500">
                                        PROSENTASE HADIR
                                      </th>
                                      <th className="px-2 py-2 text-center font-bold text-white text-[10px] uppercase tracking-wider border-r border-emerald-500">
                                        PROSENTASE TIDAK HADIR
                                      </th>
                                    </Fragment>
                                  ))}
                                  <th className="px-2 py-2 text-center font-bold text-white text-[10px] uppercase tracking-wider border-r border-emerald-500">
                                    TOTAL EVENT
                                  </th>
                                  <th className="px-2 py-2 text-center font-bold text-white text-[10px] uppercase tracking-wider border-r border-emerald-500">
                                    TOTAL HADIR
                                  </th>
                                  <th className="px-2 py-2 text-center font-bold text-white text-[10px] uppercase tracking-wider border-r border-emerald-500">
                                    TOTAL TIDAK HADIR
                                  </th>
                                  <th className="px-2 py-2 text-center font-bold text-white text-[10px] uppercase tracking-wider border-r border-emerald-500">
                                    PROSENTASE HADIR
                                  </th>
                                  <th className="px-2 py-2 text-center font-bold text-white text-[10px] uppercase tracking-wider">
                                    PROSENTASE TIDAK HADIR
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-emerald-100 bg-white">
                                  <td className="px-3 py-2 text-center text-emerald-900 font-semibold">1</td>
                                  <td className="px-3 py-2 text-emerald-900 font-medium">{eventRekapPegawai.pegawai?.no_ktp || "-"}</td>
                                  <td className="px-3 py-2 text-emerald-900 font-medium">{eventRekapPegawai.pegawai?.nama || "-"}</td>
                                  {eventRekapPegawai.events.map((evt, idx) => (
                                    <Fragment key={idx}>
                                      <td className="px-2 py-2 text-center text-emerald-900 border-r border-emerald-200">
                                        {evt.total_event_berlangsung || 0}
                                      </td>
                                      <td className="px-2 py-2 text-center text-emerald-900 border-r border-emerald-200">
                                        {evt.total_hadir || 0}
                                      </td>
                                      <td className="px-2 py-2 text-center text-emerald-900 border-r border-emerald-200">
                                        {evt.total_tidak_hadir || 0}
                                      </td>
                                      <td className="px-2 py-2 text-center text-emerald-900 border-r border-emerald-200">
                                        {evt.persentase_hadir ?? 0}%
                                      </td>
                                      <td className="px-2 py-2 text-center text-emerald-900 border-r border-emerald-200">
                                        {evt.persentase_tidak_hadir ?? 0}%
                                      </td>
                                    </Fragment>
                                  ))}
                                  {eventRekapPegawai.summary && (
                                    <>
                                      <td className="px-2 py-2 text-center text-emerald-900 font-semibold border-r border-emerald-200">
                                        {eventRekapPegawai.summary.total_event_berlangsung || 0}
                                      </td>
                                      <td className="px-2 py-2 text-center text-emerald-900 font-semibold border-r border-emerald-200">
                                        {eventRekapPegawai.summary.total_hadir || 0}
                                      </td>
                                      <td className="px-2 py-2 text-center text-emerald-900 font-semibold border-r border-emerald-200">
                                        {eventRekapPegawai.summary.total_tidak_hadir || 0}
                                      </td>
                                      <td className="px-2 py-2 text-center text-emerald-900 font-semibold border-r border-emerald-200">
                                        {eventRekapPegawai.summary.persentase_hadir ?? 0}%
                                      </td>
                                      <td className="px-2 py-2 text-center text-emerald-900 font-semibold">
                                        {eventRekapPegawai.summary.persentase_tidak_hadir ?? 0}%
                                      </td>
                                    </>
                                  )}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {eventRekapPegawai.summary && (
                          <div className="bg-emerald-50 p-4 border-2 border-emerald-200 flex items-start gap-3">
                            <span className="material-icons text-emerald-600 text-2xl">summarize</span>
                            <div>
                              <h4 className="font-bold text-emerald-800 mb-2">Summary</h4>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                                <div>
                                  <span className="font-semibold">Total Event Berlangsung:</span>{" "}
                                  {eventRekapPegawai.summary.total_event_berlangsung || 0}
                                </div>
                                <div>
                                  <span className="font-semibold">Total Hadir:</span>{" "}
                                  {eventRekapPegawai.summary.total_hadir || 0}
                                </div>
                                <div>
                                  <span className="font-semibold">Total Tidak Hadir:</span>{" "}
                                  {eventRekapPegawai.summary.total_tidak_hadir || 0}
                                </div>
                                <div>
                                  <span className="font-semibold">Prosentase Hadir:</span>{" "}
                                  {eventRekapPegawai.summary.persentase_hadir ?? 0}%
                                </div>
                                <div>
                                  <span className="font-semibold">Prosentase Tidak Hadir:</span>{" "}
                                  {eventRekapPegawai.summary.persentase_tidak_hadir ?? 0}%
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleDownloadRekap}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                        >
                          <span className="material-icons text-lg">download</span>
                          Download Rekap Presensi Event
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Event;
