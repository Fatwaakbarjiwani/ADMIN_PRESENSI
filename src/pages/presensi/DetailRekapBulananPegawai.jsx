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
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center"
        >
          <span className="material-icons text-gray-600">arrow_back</span>
        </button>
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

      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-4 px-2 md:px-0">
        {/* Navigation & Title */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
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
              <div className="overflow-x-auto border border-gray-200 shadow-sm">
                <table className="min-w-full text-xs">
                  <thead className="bg-emerald-600 text-white">
                    <tr>
                      <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-32">
                        BULAN
                      </th>
                      <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24">
                        HADIR
                      </th>
                      <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24">
                        IZIN
                      </th>
                      <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24">
                        SAKIT
                      </th>
                      <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24">
                        CUTI
                      </th>
                      <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-28">
                        TIDAK HADIR
                      </th>
                      <th className="px-3 py-3 text-center font-bold text-sm w-32">
                        BELUM PRESENSI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRekap?.length > 0 ? (
                      detailRekap.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`transition hover:bg-emerald-50 border-b border-gray-100 ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-semibold">
                            {bulanLabels[row.bulan] || row.bulan}
                          </td>
                          <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                            <span className="font-bold text-emerald-700">
                              {row.hadir}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                            <span className="font-bold text-emerald-600">
                              {row.izin}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                            <span className="font-bold text-emerald-500">
                              {row.sakit}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                            <span className="font-bold text-emerald-400">
                              {row.cuti}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                            <span className="font-bold text-gray-500">
                              {row.tidak_hadir}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center align-middle text-sm">
                            <span className="font-bold text-gray-400">
                              {row.belum_presensi}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center">
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
