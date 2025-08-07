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
        acc.hadir += item.hadir || 0;
        acc.izin += item.izin || 0;
        acc.sakit += item.sakit || 0;
        acc.cuti += item.cuti || 0;
        acc.tidak_hadir += item.tidak_hadir || 0;
        acc.belum_presensi += item.belum_presensi || 0;
        return acc;
      },
      {
        hadir: 0,
        izin: 0,
        sakit: 0,
        cuti: 0,
        tidak_hadir: 0,
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
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-green-200 bg-primary p-2 rounded opacity-80">
          assessment
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Detail Rekap Bulanan Pegawai
          </div>
          <div className="text-gray-600 text-base font-medium">
            {getNamaLengkap(pegawaiData)} - Tahun {tahun}
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
              Rekap Presensi Bulanan - {tahun}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {totalStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Hadir</div>
              <div className="text-xl font-bold text-emerald-700">
                {totalStats.hadir}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Izin</div>
              <div className="text-xl font-bold text-emerald-600">
                {totalStats.izin}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Sakit</div>
              <div className="text-xl font-bold text-emerald-500">
                {totalStats.sakit}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Cuti</div>
              <div className="text-xl font-bold text-emerald-400">
                {totalStats.cuti}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Tidak Hadir</div>
              <div className="text-xl font-bold text-gray-500">
                {totalStats.tidak_hadir}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Belum Presensi</div>
              <div className="text-xl font-bold text-gray-400">
                {totalStats.belum_presensi}
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800">
              Detail Rekap Per Bulan
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Rincian presensi pegawai per bulan tahun {tahun}
            </p>
          </div>

          {detailRekapLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold">
                <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                Memuat data rekap...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-emerald-50 border-b border-emerald-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-emerald-800 text-sm uppercase tracking-wide">
                      Bulan
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-emerald-800 text-sm uppercase tracking-wide">
                      Hadir
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-emerald-800 text-sm uppercase tracking-wide">
                      Izin
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-emerald-800 text-sm uppercase tracking-wide">
                      Sakit
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-emerald-800 text-sm uppercase tracking-wide">
                      Cuti
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-emerald-800 text-sm uppercase tracking-wide">
                      Tidak Hadir
                    </th>
                    <th className="px-6 py-4 text-center font-bold text-emerald-800 text-sm uppercase tracking-wide">
                      Belum Presensi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {detailRekap?.length > 0 ? (
                    detailRekap.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {bulanLabels[row.bulan] || row.bulan}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-emerald-700">
                            {row.hadir}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-emerald-600">
                            {row.izin}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-emerald-500">
                            {row.sakit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-emerald-400">
                            {row.cuti}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-gray-500">
                            {row.tidak_hadir}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-gray-400">
                            {row.belum_presensi}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <div className="text-lg font-semibold mb-2">
                            Tidak ada data
                          </div>
                          <div className="text-sm">
                            Tidak ada data rekap untuk tahun {tahun}
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
