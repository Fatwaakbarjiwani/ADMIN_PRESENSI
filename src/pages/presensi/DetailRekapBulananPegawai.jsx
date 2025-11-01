import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { fetchPresensiRekapBulananPegawai } from "../../redux/actions/presensiAction";
import { fetchPegawai } from "../../redux/actions/pegawaiAction";

export default function DetailRekapBulananPegawai() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pegawai_id } = useParams();
  const [searchParams] = useSearchParams();
  const tahun = searchParams.get("tahun") || new Date().getFullYear();

  const detailRekap = useSelector((state) => state.presensi.detailRekap);
  const detailRekapLoading = useSelector(
    (state) => state.presensi.detailRekapLoading
  );
  const pegawai = useSelector((state) => state.pegawai.data);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (token && pegawai_id && tahun) {
      dispatch(fetchPresensiRekapBulananPegawai(pegawai_id, tahun));
    }
  }, [dispatch, token, pegawai_id, tahun]);

  useEffect(() => {
    if (token) {
      dispatch(fetchPegawai(user?.role === "super_admin", token));
    }
  }, [token, user]);

  // Ambil data pegawai berdasarkan pegawai_id
  const pegawaiData = pegawai?.find((p) => p.id == pegawai_id);

  // Hitung total untuk summary
  const totalStats = useMemo(() => {
    if (!detailRekap?.length) return null;

    return detailRekap.reduce(
      (acc, item) => {
        acc.hari_efektif += item.hari_efektif || 0;
        acc.hadir += item.hadir || 0;
        acc.izin += item.izin || 0;
        acc.sakit += item.sakit || 0;
        acc.cuti += item.cuti || 0;
        acc.tidak_hadir += item.tidak_hadir || 0;
        acc.dinas += item.dinas || 0;
        acc.lembur += item.lembur || 0;
        acc.terlambat += item.terlambat || 0;
        acc.pulang_awal += item.pulang_awal || 0;
        acc.tidak_absen_masuk += item.tidak_absen_masuk || 0;
        acc.tidak_absen_pulang += item.tidak_absen_pulang || 0;
        acc.belum_presensi += item.belum_presensi || 0;
        return acc;
      },
      {
        hari_efektif: 0,
        hadir: 0,
        izin: 0,
        sakit: 0,
        cuti: 0,
        tidak_hadir: 0,
        dinas: 0,
        lembur: 0,
        terlambat: 0,
        pulang_awal: 0,
        tidak_absen_masuk: 0,
        tidak_absen_pulang: 0,
        belum_presensi: 0,
      }
    );
  }, [detailRekap]);

  const bulanLabels = {
    januari: "Januari",
    februari: "Februari",
    maret: "Maret",
    april: "April",
    mei: "Mei",
    juni: "Juni",
    juli: "Juli",
    agustus: "Agustus",
    september: "September",
    oktober: "Oktober",
    november: "November",
    desember: "Desember",
  };

  const getNamaLengkap = (pegawai) => {
    if (!pegawai) return "Loading...";
    return [pegawai.gelar_depan, pegawai.nama, pegawai.gelar_belakang]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 transition flex items-center"
        >
          <span className="material-icons text-gray-600">arrow_back</span>
        </button>
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white">assessment</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Detail Rekap Bulanan Pegawai
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            {getNamaLengkap(pegawaiData)} - Tahun {tahun}
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-7xl flex flex-col gap-6">
        {/* Navigation & Title */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold text-emerald-700">
              REKAP PRESENSI PER BULAN - {tahun}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {totalStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Hari Efektif
              </div>
              <div className="text-xl font-bold text-blue-600">
                {totalStats.hari_efektif}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Hadir
              </div>
              <div className="text-xl font-bold text-emerald-700">
                {totalStats.hadir}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">Izin</div>
              <div className="text-xl font-bold text-emerald-600">
                {totalStats.izin}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Sakit
              </div>
              <div className="text-xl font-bold text-emerald-500">
                {totalStats.sakit}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">Cuti</div>
              <div className="text-xl font-bold text-emerald-400">
                {totalStats.cuti}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Tidak Hadir
              </div>
              <div className="text-xl font-bold text-red-500">
                {totalStats.tidak_hadir}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Dinas
              </div>
              <div className="text-xl font-bold text-purple-600">
                {totalStats.dinas}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Lembur
              </div>
              <div className="text-xl font-bold text-indigo-600">
                {totalStats.lembur}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Terlambat
              </div>
              <div className="text-xl font-bold text-orange-500">
                {totalStats.terlambat}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Pulang Awal
              </div>
              <div className="text-xl font-bold text-orange-600">
                {totalStats.pulang_awal}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Tidak Absen Masuk
              </div>
              <div className="text-xl font-bold text-red-600">
                {totalStats.tidak_absen_masuk}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Tidak Absen Pulang
              </div>
              <div className="text-xl font-bold text-red-700">
                {totalStats.tidak_absen_pulang}
              </div>
            </div>
            <div className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
              <div className="text-xs text-gray-500 mb-1 font-medium">
                Belum Presensi
              </div>
              <div className="text-xl font-bold text-gray-400">
                {totalStats.belum_presensi}
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-emerald-600">
                  bar_chart
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Detail Rekap Per Bulan
                </h3>
                <p className="text-emerald-100 text-xs font-medium">
                  Rincian presensi pegawai per bulan tahun {tahun}
                </p>
              </div>
            </div>
          </div>

          {detailRekapLoading ? (
            <div className="text-center py-12 text-emerald-600 font-bold flex items-center justify-center gap-2">
              <span className="material-icons animate-spin">refresh</span>
              Memuat data rekap...
            </div>
          ) : (
            <>
              <div className="m-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="material-icons">description</span>
                  <span className="font-semibold">
                    Total Data: {detailRekap?.length || 0} records
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs bg-white">
                  <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                    <tr>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-32">
                        BULAN
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-24">
                        HARI EFEKTIF
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-24">
                        HADIR
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-24">
                        IZIN
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-24">
                        SAKIT
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-24">
                        CUTI
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-28">
                        TIDAK HADIR
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-28">
                        DINAS
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-28">
                        LEMBUR
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-28">
                        TERLAMBAT
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-28">
                        PULANG AWAL
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-28">
                        TIDAK ABSEN MASUK
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-emerald-200 w-28">
                        TIDAK ABSEN PULANG
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider w-32">
                        BELUM PRESENSI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRekap?.length > 0 ? (
                      detailRekap.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                            idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                          }`}
                        >
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100 font-semibold">
                            {bulanLabels[row.bulan] || row.bulan}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-emerald-700">
                              {row.hari_efektif}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-emerald-700">
                              {row.hadir}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-emerald-600">
                              {row.izin}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-emerald-500">
                              {row.sakit}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-emerald-400">
                              {row.cuti}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-gray-500">
                              {row.tidak_hadir}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-gray-500">
                              {row.dinas}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-gray-500">
                              {row.lembur}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-gray-500">
                              {row.terlambat}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-gray-500">
                              {row.pulang_awal}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-gray-500">
                              {row.tidak_absen_masuk}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            <span className="font-bold text-gray-500">
                              {row.tidak_absen_pulang}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm">
                            <span className="font-bold text-gray-400">
                              {row.belum_presensi}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={14} className="px-3 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-icons text-4xl text-gray-300">
                              inbox
                            </span>
                            <span className="font-semibold text-gray-400">
                              Tidak ada data
                            </span>
                            <span className="text-sm text-gray-400">
                              Tidak ada data rekap untuk tahun {tahun}
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
    </div>
  );
}
