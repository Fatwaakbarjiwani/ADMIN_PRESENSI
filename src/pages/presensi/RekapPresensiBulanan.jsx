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
  const rekapData = useSelector((state) => state.presensi.rekapData);
  const rekapLoading = useSelector((state) => state.presensi.rekapLoading);
  const user = useSelector((state) => state.auth.user);

  const [tab, setTab] = useState("history");
  const [tanggal, setTanggal] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (user !== null) {
      dispatch(fetchPresensiHistoryByUnit());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (tab === "rekap") {
      if (tanggal) {
        dispatch(fetchPresensiRekapByUnit(tanggal));
      } else {
        dispatch(fetchPresensiRekapByUnit());
      }
    }
  }, [tab, tanggal, dispatch]);

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-green-200 bg-primary p-2 rounded opacity-80">
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
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border border-gray-200 rounded-md overflow-hidden shadow-sm">
                  <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                    <tr>
                      <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-12 text-base">
                        No
                      </th>
                      <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-32 text-base">
                        No KTP
                      </th>
                      <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-56 text-base">
                        Nama
                      </th>
                      <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-32 text-base">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                        Waktu
                      </th>
                      <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={
                            "transition hover:bg-emerald-50 " +
                            (idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                          }
                        >
                          <td className="px-4 py-4 text-center align-middle border-b border-gray-100 font-semibold text-sm">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                            {row.no_ktp}
                          </td>
                          <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-sm">
                            {row.nama}
                          </td>
                          <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-sm">
                            {row.status}
                          </td>
                          {/* <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm font-bold">
                            {row.status === "hadir" && (
                              <span className="text-emerald-700">Hadir</span>
                            )}
                            {row.status === "izin" && (
                              <span className="text-sky-700">Izin</span>
                            )}
                            {row.status === "cuti" && (
                              <span className="text-yellow-700">Cuti</span>
                            )}
                            {row.status === "sakit" && (
                              <span className="text-red-700">Sakit</span>
                            )}
                            {row.status === "tidak masuk" && (
                              <span className="text-gray-500">Tidak Masuk</span>
                            )}
                          </td> */}
                          <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                            {new Date(row.waktu).toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                            {row.keterangan || "-"}
                          </td>
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
                  value={tanggal || ""}
                  onChange={(e) => setTanggal(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  placeholder="Pilih tanggal"
                />
                {tanggal && (
                  <button
                    type="button"
                    className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => setTanggal("")}
                    title="Kosongkan tanggal"
                  >
                    HAPUS FILTER TANGGAL
                  </button>
                )}
              </div>
              {rekapLoading ? (
                <div className="text-center py-8 text-emerald-600 font-bold">
                  Memuat rekap...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border border-gray-200 rounded-md overflow-hidden shadow-sm">
                    <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                      <tr>
                        <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-12 text-base">
                          No
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-32 text-base">
                          No KTP
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-56 text-base">
                          Nama
                        </th>
                        <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-24 text-base">
                          Hadir
                        </th>
                        <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-32 text-base">
                          Tidak Masuk
                        </th>
                        <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-24 text-base">
                          Izin
                        </th>
                        <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-24 text-base">
                          Cuti
                        </th>
                        <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-24 text-base">
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
                              "transition hover:bg-emerald-50 " +
                              (idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                            }
                          >
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100 font-semibold text-sm">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                              {row.no_ktp}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-sm">
                              {row.nama}
                            </td>
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100 text-sm">
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                                {row.total_hadir}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100 text-sm">
                              <span className="inline-block px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-bold">
                                {row.total_tidak_masuk}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100 text-sm">
                              <span className="inline-block px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-bold">
                                {row.total_izin}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100 text-sm">
                              <span className="inline-block px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 font-bold">
                                {row.total_cuti}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100 text-sm">
                              <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">
                                {row.total_sakit}
                              </span>
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
