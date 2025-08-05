import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPresensiDetailHistoryByUnit } from "../../redux/actions/presensiAction";
import { fetchPegawai } from "../../redux/actions/pegawaiAction";

export default function DetailHistoryPresensi() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pegawai_id } = useParams();

  const detailHistory = useSelector((state) => state.presensi.detailHistory);
  const detailHistoryLoading = useSelector(
    (state) => state.presensi.detailHistoryLoading
  );
  const pegawai = useSelector((state) => state.pegawai.data);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (token && pegawai_id) {
      dispatch(fetchPresensiDetailHistoryByUnit(pegawai_id));
    }
  }, [dispatch, token, pegawai_id]);

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
    return detailHistory[0]?.presensi_list || [];
  }, [detailHistory]);

  const getNamaLengkap = (pegawai) => {
    if (!pegawai) return "Loading...";
    return [
      pegawai.gelar_depan,
      pegawai.nama_depan,
      pegawai.nama_tengah,
      pegawai.nama_belakang,
      pegawai.gelar_belakang,
    ]
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
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-green-200 bg-primary p-2 rounded opacity-80">
          history
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Detail History Presensi Pegawai
          </div>
          <div className="text-gray-600 text-base font-medium">
            {getNamaLengkap(pegawaiData)} -{" "}
            {pegawaiFromResponse?.no_ktp || "Loading..."}
          </div>
        </div>
      </div>

      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-6 px-2 md:px-0">
        {/* Navigation & Title */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
              onClick={() => navigate("/rekap_presensi")}
            >
              <span className="material-icons text-base">arrow_back</span>
              Kembali
            </button>
            <div className="text-xl font-bold text-emerald-700">
              History Presensi - {pegawaiFromResponse?.nama || "Loading..."}
            </div>
          </div>
        </div>

        {/* Employee Info Card */}
        {pegawaiFromResponse && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="material-icons text-emerald-600 text-2xl">
                person
              </span>
              <h3 className="text-lg font-bold text-emerald-700">
                Informasi Pegawai
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Nama:
                </label>
                <p className="text-base font-bold text-emerald-800">
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
                  ID Pegawai:
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

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800">
              Detail History Presensi
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Rincian history presensi pegawai dari 2024-07-01 hingga 2025-07-31
            </p>
          </div>

          {detailHistoryLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold">
                <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                Memuat data history presensi...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-emerald-50 border-b border-emerald-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-emerald-800 text-sm uppercase tracking-wide w-16">
                      No
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-800 text-sm uppercase tracking-wide w-32">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-800 text-sm uppercase tracking-wide w-24">
                      Hari
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-emerald-800 text-sm uppercase tracking-wide w-32">
                      Masuk
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-emerald-800 text-sm uppercase tracking-wide w-32">
                      Pulang
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-emerald-800 text-sm uppercase tracking-wide w-40">
                      Status Presensi
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-800 text-sm uppercase tracking-wide">
                      Keterangan
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-emerald-800 text-sm uppercase tracking-wide w-48">
                      Lokasi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {presensiList?.length > 0 ? (
                    presensiList.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-gray-900 text-center">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {new Date(row.tanggal).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {row.hari}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-700">
                              {formatWaktu(row.masuk?.waktu)}
                            </div>
                            {row.masuk && (
                              <div>{getStatusBadge(row.masuk.status)}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-700">
                              {formatWaktu(row.pulang?.waktu)}
                            </div>
                            {row.pulang && (
                              <div>{getStatusBadge(row.pulang.status)}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="space-y-1">
                            {pegawaiFromResponse?.status_presensi && (
                              <div className="text-xs">
                                {getStatusPresensiBadge(
                                  pegawaiFromResponse.status_presensi
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-900">
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
                        <td className="px-4 py-3 text-gray-900">
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <div className="text-lg font-semibold mb-2">
                            Tidak ada data
                          </div>
                          <div className="text-sm">
                            Tidak ada data history presensi untuk pegawai ini
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
