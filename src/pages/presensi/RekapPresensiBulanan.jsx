import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPresensiHistoryByUnit,
  fetchPresensiRekapByUnit,
} from "../../redux/actions/presensiAction";

export default function RekapPresensiBulanan() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.presensi.data);
  const loading = useSelector((state) => state.presensi.loading);
  const error = useSelector((state) => state.presensi.error);
  const rekapData = useSelector((state) => state.presensi.rekapData);
  const rekapLoading = useSelector((state) => state.presensi.rekapLoading);
  const rekapError = useSelector((state) => state.presensi.rekapError);
  const user = useSelector((state) => state.auth.user);

  const [tab, setTab] = useState("history");
  const [tanggal, setTanggal] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchPresensiHistoryByUnit());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (tab === "rekap" && tanggal) {
      dispatch(fetchPresensiRekapByUnit(tanggal));
    }
  }, [tab, tanggal, dispatch]);

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          table_chart
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Presensi Unit
          </div>
          <div className="text-gray-600 text-base font-medium">
            Pantau history & rekap presensi per unit
          </div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        <div className="border border-gray-300 bg-white p-4">
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded font-bold text-sm transition border ${
                tab === "history"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("history")}
            >
              History Presensi
            </button>
            <button
              className={`px-4 py-2 rounded font-bold text-sm transition border ${
                tab === "rekap"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("rekap")}
            >
              Rekap Presensi
            </button>
          </div>
          {tab === "history" &&
            (loading ? (
              <div className="text-center py-8 text-emerald-600 font-bold">
                Memuat data...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 font-bold">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border border-gray-200 rounded-md overflow-hidden shadow-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold text-gray-500">
                        No
                      </th>
                      <th className="px-3 py-2 text-left font-bold text-gray-500">
                        No KTP
                      </th>
                      <th className="px-3 py-2 text-left font-bold text-gray-500">
                        Nama
                      </th>
                      <th className="px-3 py-2 text-left font-bold text-gray-500">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left font-bold text-gray-500">
                        Waktu
                      </th>
                      <th className="px-3 py-2 text-left font-bold text-gray-500">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-3 py-2">{idx + 1}</td>
                          <td className="px-3 py-2">{row.no_ktp}</td>
                          <td className="px-3 py-2">{row.nama}</td>
                          <td className="px-3 py-2">{row.status}</td>
                          <td className="px-3 py-2">
                            {new Date(row.waktu).toLocaleString("id-ID")}
                          </td>
                          <td className="px-3 py-2">{row.keterangan || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center text-gray-400 py-4"
                        >
                          Tidak ada data ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          {tab === "rekap" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm font-semibold text-gray-700">
                  Tanggal:
                </label>
                <input
                  type="date"
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>
              {rekapLoading ? (
                <div className="text-center py-8 text-emerald-600 font-bold">
                  Memuat rekap...
                </div>
              ) : rekapError ? (
                <div className="text-center py-8 text-red-500 font-bold">
                  {rekapError}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border border-gray-200 rounded-md overflow-hidden shadow-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold text-gray-500">
                          No
                        </th>
                        <th className="px-3 py-2 text-left font-bold text-gray-500">
                          No KTP
                        </th>
                        <th className="px-3 py-2 text-left font-bold text-gray-500">
                          Nama
                        </th>
                        <th className="px-3 py-2 text-center font-bold text-gray-500">
                          Hadir
                        </th>
                        <th className="px-3 py-2 text-center font-bold text-gray-500">
                          Tidak Masuk
                        </th>
                        <th className="px-3 py-2 text-center font-bold text-gray-500">
                          Izin
                        </th>
                        <th className="px-3 py-2 text-center font-bold text-gray-500">
                          Cuti
                        </th>
                        <th className="px-3 py-2 text-center font-bold text-gray-500">
                          Sakit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rekapData.length > 0 ? (
                        rekapData.map((row, idx) => (
                          <tr
                            key={row.id}
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-3 py-2">{idx + 1}</td>
                            <td className="px-3 py-2">{row.no_ktp}</td>
                            <td className="px-3 py-2">{row.nama}</td>
                            <td className="px-3 py-2 text-center">
                              {row.total_hadir}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.total_tidak_masuk}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.total_izin}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.total_cuti}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.total_sakit}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center text-gray-400 py-4"
                          >
                            Tidak ada data rekap.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
