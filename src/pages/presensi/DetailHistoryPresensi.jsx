import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchPresensiDetailHistoryByUnit } from "../../redux/actions/presensiAction";
import { fetchPegawai } from "../../redux/actions/pegawaiAction";

export default function DetailHistoryPresensi() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { pegawai_id } = useParams();
  const { unit_id } = useParams();

  const detailHistory = useSelector((state) => state.presensi.detailHistory);
  const detailHistoryLoading = useSelector(
    (state) => state.presensi.detailHistoryLoading
  );
  const pegawai = useSelector((state) => state.pegawai.data);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const isMonitoring = user?.role === "monitoring";
  const isSuperAdmin = user?.role === "super_admin" || isMonitoring;

  // Tambahkan state untuk filter tanggal
  const today = new Date();
  const defaultFrom = today.toISOString().slice(0, 10);
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const defaultTo = nextYear.toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);

  // Tambahkan state untuk modal edit, data edit, dan fungsi open/close modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fungsi untuk handle filter
  const handleFilter = () => {
    if (token && pegawai_id) {
      dispatch(
        fetchPresensiDetailHistoryByUnit(
          pegawai_id,
          fromDate,
          toDate,
          unit_id,
          isSuperAdmin
        )
      );
    }
  };

  // Helper untuk format waktu ke input datetime-local
  function toDatetimeLocal(val) {
    if (!val) return "";
    // val: '2025-08-05 08:00:00' => '2025-08-05T08:00'
    const [time] = val.split(" ");
    if (!time) return "";
    return `${time.slice(0, 5)}`;
  }
  const handleEditPresensi = (row) => {
    setEditData({
      waktu_masuk: row.masuk?.waktu ? toDatetimeLocal(row.masuk.waktu) : "",
      waktu_pulang: row.pulang?.waktu ? toDatetimeLocal(row.pulang.waktu) : "",
      status_masuk: row.masuk?.status || "",
      status_pulang: row.pulang?.status || "",
      keterangan_masuk: row.masuk?.keterangan || "",
      keterangan_pulang: row.pulang?.keterangan || "",
      status_presensi: row.status_presensi || "",
      tanggal: row.tanggal,
      id: row.id,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditData(null);
    setErrorMsg("");
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      // console.log(editData.waktu_masuk);
      // console.log(editData.waktu_masuk.replace("T", " ") + ":00");

      // Siapkan endpoint dan body
      const base_url = import.meta.env.VITE_API_URL || "";
      const url = `${base_url}/api/presensi/update-by-admin-unit/${pegawai_id}/${editData.tanggal}`;
      const body = {
        updates: [
          {
            waktu_masuk: editData.waktu_masuk,
            waktu_pulang: editData.waktu_pulang,
            status_masuk: editData.status_masuk,
            status_pulang: editData.status_pulang,
            keterangan_masuk: editData.keterangan_masuk,
            keterangan_pulang: editData.keterangan_pulang,
            status_presensi: editData.status_presensi,
          },
        ],
      };
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal update presensi");
      }
      // Sukses, refresh data
      setShowEditModal(false);
      setEditData(null);
      dispatch(fetchPresensiDetailHistoryByUnit(pegawai_id, fromDate, toDate));
    } catch (err) {
      setErrorMsg(err.message || "Gagal update presensi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch data saat mount dan saat filter berubah
  useEffect(() => {
    if (token && pegawai_id) {
      dispatch(
        fetchPresensiDetailHistoryByUnit(
          pegawai_id,
          fromDate,
          toDate,
          unit_id,
          isSuperAdmin
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token, pegawai_id, unit_id, isSuperAdmin]);

  useEffect(() => {
    if (token) {
      dispatch(fetchPegawai(user?.role === "super_admin", token));
    }
  }, [token, user]);

  // Ambil data pegawai berdasarkan pegawai_id
  const pegawaiData = pegawai?.find((p) => p.id == pegawai_id);

  // Ambil data pegawai dari response baru
  const pegawaiFromResponse = useMemo(() => {
    if (!detailHistory?.length) return null;
    return detailHistory[0]?.pegawai || null;
  }, [detailHistory]);

  // Ambil data presensi dari response baru
  const presensiList = useMemo(() => {
    if (!detailHistory?.length) return [];
    return detailHistory[0]?.presensi || [];
  }, [detailHistory]);

  const getNamaLengkap = (pegawai) => {
    if (!pegawai) return "Loading...";
    return [pegawai.gelar_depan, pegawai.nama, pegawai.gelar_belakang]
      .filter(Boolean)
      .join(" ");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      absen_masuk: {
        color: "bg-emerald-100 text-emerald-800",
        label: "Absen Masuk",
      },
      absen_pulang: {
        color: "bg-blue-100 text-blue-800",
        label: "Absen Pulang",
      },
      tidak_absen_masuk: {
        color: "bg-red-100 text-red-800",
        label: "Tidak Absen Masuk",
      },
      tidak_absen_pulang: {
        color: "bg-orange-100 text-orange-800",
        label: "Tidak Absen Pulang",
      },
      terlambat: { color: "bg-yellow-100 text-yellow-800", label: "Terlambat" },
      pulang_awal: { color: "bg-pink-100 text-pink-800", label: "Pulang Awal" },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getStatusPresensiBadge = (status) => {
    const statusConfig = {
      hadir: { color: "bg-emerald-100 text-emerald-800", label: "Hadir" },
      tidak_hadir: { color: "bg-red-100 text-red-800", label: "Tidak Hadir" },
      izin: { color: "bg-sky-100 text-sky-800", label: "Izin" },
      sakit: { color: "bg-red-100 text-red-800", label: "Sakit" },
      cuti: { color: "bg-yellow-100 text-yellow-800", label: "Cuti" },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatWaktu = (waktu) => {
    if (!waktu) return "-";
    return waktu;
  };

  const formatLokasi = (lokasi) => {
    if (!lokasi || !Array.isArray(lokasi)) return "-";
    return `${lokasi[0]?.toFixed(6)}, ${lokasi[1]?.toFixed(6)}`;
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <button
          onClick={() => (isMonitoring ? navigate("/monitoring_presensi") : navigate(-1))}
          className="p-2 hover:bg-gray-100 transition flex items-center"
        >
          <span className="material-icons text-gray-600">arrow_back</span>
        </button>
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white">history</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Detail History Presensi Pegawai
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            {getNamaLengkap(pegawaiData)} -{" "}
            {pegawaiFromResponse?.no_ktp || "Loading..."}
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-full flex flex-col gap-6">
        {/* Navigation & Title */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold text-emerald-700">
              History Presensi - {pegawaiFromResponse?.nama || "Loading..."}
            </div>
          </div>
        </div>

        {/* Employee Info Card */}
        {pegawaiFromResponse && (
          <div className="bg-white border-2 border-emerald-200 shadow-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="material-icons text-emerald-600 text-2xl">
                person
              </span>
              <h3 className="text-lg font-black text-emerald-800 uppercase tracking-wide">
                Informasi Pegawai
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Nama:
                </label>
                <p className="text-base font-black text-emerald-800">
                  {pegawaiFromResponse.nama}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  No KTP:
                </label>
                <p className="text-base text-gray-800">
                  {pegawaiFromResponse.no_ktp}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  ID:
                </label>
                <p className="text-base text-gray-800">
                  {pegawaiFromResponse.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Unit Detail:
                </label>
                <p className="text-base text-gray-800">
                  {pegawaiFromResponse.unit_detail_name || "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter tanggal */}
        <div className="flex gap-3 items-center mb-2">
          <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
            Dari:
          </label>
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border-2 border-emerald-300 px-3 py-2 text-sm"
          />
          <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
            Sampai:
          </label>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border-2 border-emerald-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleFilter}
            className="ml-2 px-4 py-2 bg-emerald-600 text-white font-bold text-xs border-2 border-emerald-700 hover:bg-emerald-700 transition"
          >
            Terapkan
          </button>
        </div>

        {/* Main Table */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-emerald-600">
                  timeline
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Detail History Presensi
                </h3>
                <p className="text-emerald-100 text-xs font-medium">
                  Rincian history presensi pegawai dari {fromDate} hingga{" "}
                  {toDate}
                </p>
              </div>
            </div>
          </div>
          {detailHistoryLoading ? (
            <div className="text-center py-12 text-emerald-600 font-bold flex items-center justify-center gap-2">
              <span className="material-icons animate-spin">refresh</span>
              Memuat data history presensi...
            </div>
          ) : (
            <>
              <div className="m-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="material-icons">description</span>
                  <span className="font-semibold">
                    Total Data: {presensiList?.length || 0} records
                  </span>
                </div>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full text-xs bg-white">
                  <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                    <tr>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-16">
                        NO
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-32">
                        TANGGAL
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-24">
                        HARI
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-32">
                        MASUK
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-32">
                        PULANG
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-40">
                        STATUS PRESENSI
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-48">
                        KETERANGAN
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-48">
                        LOKASI
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider w-20">
                        AKSI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {presensiList?.length > 0 ? (
                      presensiList.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                            idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                          }`}
                        >
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100 font-semibold">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            {new Date(row.tanggal).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100 font-medium">
                            {row.hari}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-gray-700">
                                {formatWaktu(row.masuk?.waktu)}
                              </div>
                              {row.masuk && (
                                <div>{getStatusBadge(row.masuk.status)}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-gray-700">
                                {formatWaktu(row.pulang?.waktu)}
                              </div>
                              {row.pulang && (
                                <div>{getStatusBadge(row.pulang.status)}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <div className="space-y-1">
                              {row?.status_presensi && (
                                <div className="text-xs">
                                  {getStatusPresensiBadge(row.status_presensi)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <div className="space-y-1 text-sm">
                              {row.masuk?.keterangan && (
                                <div className="flex items-start gap-1">
                                  <span className="font-semibold text-blue-600 text-xs mt-0.5">
                                    M:
                                  </span>
                                  <span className="text-gray-700">
                                    {row.masuk.keterangan}
                                  </span>
                                </div>
                              )}
                              {row.pulang?.keterangan && (
                                <div className="flex items-start gap-1">
                                  <span className="font-semibold text-green-600 text-xs mt-0.5">
                                    P:
                                  </span>
                                  <span className="text-gray-700">
                                    {row.pulang.keterangan}
                                  </span>
                                </div>
                              )}
                              {!row.masuk?.keterangan &&
                                !row.pulang?.keterangan && (
                                  <span className="text-gray-400">-</span>
                                )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <div className="space-y-1 text-sm">
                              {row.masuk?.lokasi && (
                                <div className="flex items-start gap-1">
                                  <span className="font-semibold text-blue-600 text-xs mt-0.5">
                                    M:
                                  </span>
                                  <span className="text-gray-700 text-xs">
                                    {formatLokasi(row.masuk.lokasi)}
                                  </span>
                                </div>
                              )}
                              {row.pulang?.lokasi && (
                                <div className="flex items-start gap-1">
                                  <span className="font-semibold text-green-600 text-xs mt-0.5">
                                    P:
                                  </span>
                                  <span className="text-gray-700 text-xs">
                                    {formatLokasi(row.pulang.lokasi)}
                                  </span>
                                </div>
                              )}
                              {!row.masuk?.lokasi && !row.pulang?.lokasi && (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm">
                            <button
                              onClick={() => handleEditPresensi(row)}
                              className="w-8 h-8 inline-flex items-center justify-center text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 transition"
                              title="Edit Pemutihan"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.79l-4 1 1-4 14.362-14.303z"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="px-3 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-icons text-4xl text-gray-300">
                              inbox
                            </span>
                            <span className="font-semibold text-gray-400">
                              Tidak ada data
                            </span>
                            <span className="text-sm text-gray-400">
                              Tidak ada data history presensi untuk pegawai ini
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Edit Presensi */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeEditModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-lg font-bold mb-4">
              Edit Presensi (Pemutihan)
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold">
                  Waktu Masuk
                </label>
                <input
                  type="time"
                  name="waktu_masuk"
                  value={editData?.waktu_masuk || ""}
                  onChange={handleEditInputChange}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">
                  Waktu Pulang
                </label>
                <input
                  type="time"
                  name="waktu_pulang"
                  value={editData?.waktu_pulang || ""}
                  onChange={handleEditInputChange}
                  className="border px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold">
                    Status Masuk
                  </label>
                  <select
                    name="status_masuk"
                    value={editData?.status_masuk || ""}
                    onChange={handleEditInputChange}
                    className="border px-2 py-1 rounded w-full"
                    required
                  >
                    <option value="">Pilih</option>
                    <option value="absen_masuk">Absen Masuk</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="tidak_absen_masuk">Tidak Absen Masuk</option>
                    <option value="tidak_hadir">Tidak Hadir</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="cuti">Cuti</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold">
                    Status Pulang
                  </label>
                  <select
                    name="status_pulang"
                    value={editData?.status_pulang || ""}
                    onChange={handleEditInputChange}
                    className="border px-2 py-1 rounded w-full"
                    required
                  >
                    <option value="">Pilih</option>
                    <option value="absen_pulang">Absen Pulang</option>
                    <option value="pulang_awal">Pulang Awal</option>
                    <option value="tidak_absen_pulang">
                      Tidak Absen Pulang
                    </option>
                    <option value="tidak_hadir">Tidak hadir</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="cuti">Cuti</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold">
                    Keterangan Masuk
                  </label>
                  <input
                    type="text"
                    name="keterangan_masuk"
                    value={editData?.keterangan_masuk || ""}
                    onChange={handleEditInputChange}
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold">
                    Keterangan Pulang
                  </label>
                  <input
                    type="text"
                    name="keterangan_pulang"
                    value={editData?.keterangan_pulang || ""}
                    onChange={handleEditInputChange}
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold">
                  Status Presensi
                </label>
                <select
                  name="status_presensi"
                  value={editData?.status_presensi || ""}
                  onChange={handleEditInputChange}
                  className="border px-2 py-1 rounded w-full"
                  required
                >
                  <option value="">Pilih</option>
                  <option value="hadir">Hadir</option>
                  <option value="tidak_hadir">Tidak Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="cuti">Cuti</option>
                  <option value="dinas">Dinas</option>
                </select>
              </div>
              {errorMsg && (
                <div className="text-red-600 text-sm">{errorMsg}</div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
