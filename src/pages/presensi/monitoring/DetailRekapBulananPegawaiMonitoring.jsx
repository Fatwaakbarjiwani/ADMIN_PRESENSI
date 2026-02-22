import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { fetchPresensiRekapBulananPegawai } from "../../../redux/actions/presensiAction";
import { fetchPegawai2 } from "../../../redux/actions/pegawaiAction";

export default function DetailRekapBulananPegawaiMonitoring() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pegawai_id } = useParams();
  const [searchParams] = useSearchParams();
  const tahun = searchParams.get("tahun") || new Date().getFullYear();
  const unitId = searchParams.get("unit_id");

  const detailRekap = useSelector((state) => state.presensi.detailRekap);
  const detailRekapLoading = useSelector((state) => state.presensi.detailRekapLoading);
  const pegawai = useSelector((state) => state.pegawai.data);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token && pegawai_id && tahun && unitId) {
      dispatch(fetchPresensiRekapBulananPegawai(pegawai_id, tahun, unitId));
    }
  }, [dispatch, token, pegawai_id, tahun, unitId]);

  useEffect(() => {
    if (token && unitId) {
      dispatch(fetchPegawai2(true, token, 1, "", unitId));
    }
  }, [dispatch, token, unitId]);

  const pegawaiData = pegawai?.find((p) => p.id == pegawai_id);

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
    januari: "Januari", februari: "Februari", maret: "Maret", april: "April",
    mei: "Mei", juni: "Juni", juli: "Juli", agustus: "Agustus",
    september: "September", oktober: "Oktober", november: "November", desember: "Desember",
  };

  const getNamaLengkap = (pegawai) => {
    if (!pegawai) return "Loading...";
    return [pegawai.gelar_depan, pegawai.nama, pegawai.gelar_belakang].filter(Boolean).join(" ");
  };

  if (!unitId) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Unit tidak valid. Kembali ke Rekap Presensi Pegawai.</p>
        <button onClick={() => navigate("/monitoring_presensi")} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <button onClick={() => navigate("/monitoring_presensi")} className="p-2 hover:bg-gray-100 transition flex items-center">
          <span className="material-icons text-gray-600">arrow_back</span>
        </button>
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white">assessment</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">Detail Rekap Bulanan Pegawai</div>
          <div className="text-emerald-600 text-sm font-medium">{getNamaLengkap(pegawaiData)} - Tahun {tahun}</div>
        </div>
      </div>
      <div className="mx-auto p-6 max-w-full flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-emerald-700">REKAP PRESENSI</div>
        </div>
        {totalStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
            {[
              ["Hari Efektif", totalStats.hari_efektif, "text-blue-600"],
              ["Hadir", totalStats.hadir, "text-emerald-700"],
              ["Izin", totalStats.izin, "text-emerald-600"],
              ["Sakit", totalStats.sakit, "text-emerald-500"],
              ["Cuti", totalStats.cuti, "text-emerald-400"],
              ["Tidak Hadir", totalStats.tidak_hadir, "text-red-500"],
              ["Dinas", totalStats.dinas, "text-purple-600"],
              ["Lembur", totalStats.lembur, "text-indigo-600"],
              ["Terlambat", totalStats.terlambat, "text-orange-500"],
              ["Pulang Awal", totalStats.pulang_awal, "text-orange-600"],
              ["Tidak Absen Masuk", totalStats.tidak_absen_masuk, "text-red-600"],
              ["Tidak Absen Pulang", totalStats.tidak_absen_pulang, "text-red-700"],
              ["Belum Presensi", totalStats.belum_presensi, "text-gray-400"],
            ].map(([label, val, cls]) => (
              <div key={label} className="bg-white p-4 border-2 border-emerald-200 shadow-lg">
                <div className="text-xs text-gray-500 mb-1 font-medium">{label}</div>
                <div className={`text-xl font-bold ${cls}`}>{val}</div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2"><span className="material-icons text-emerald-600">bar_chart</span></div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">Detail Rekap Per Bulan</h3>
                <p className="text-emerald-100 text-xs font-medium">Rincian presensi pegawai per bulan tahun {tahun}</p>
              </div>
            </div>
          </div>
          {detailRekapLoading ? (
            <div className="text-center py-12 text-emerald-600 font-bold flex items-center justify-center gap-2">
              <span className="material-icons animate-spin">refresh</span>Memuat data rekap...
            </div>
          ) : (
            <>
              <div className="m-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="material-icons">description</span>
                  <span className="font-semibold">Total Data: {detailRekap?.length || 0} records</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs bg-white border-2 border-emerald-200">
                  <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                    <tr>
                      <th rowSpan={2} className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-32">BULAN</th>
                      <th rowSpan={2} className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-24">HARI EFEKTIF</th>
                      <th colSpan={7} className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 border-b-2 border-emerald-200">HADIR</th>
                      <th colSpan={5} className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-b-2 border-emerald-200">TIDAK HADIR</th>
                    </tr>
                    <tr>
                      {["TEPAT WAKTU","TIDAK ABSEN MASUK","TIDAK ABSEN PULANG","TERLAMBAT","PULANG AWAL","LEMBUR","DINAS","ALPA","IZIN","SAKIT","CUTI","BELUM PRESENSI"].map((h) => (
                        <th key={h} className="px-2 py-2 text-center font-black text-emerald-800 text-[10px] uppercase tracking-wider border-r border-emerald-200 w-24">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailRekap?.length > 0 ? (
                      detailRekap.map((row, idx) => (
                        <tr key={idx} className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${idx % 2 === 0 ? "bg-white" : "bg-emerald-25"}`}>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100 font-semibold">{bulanLabels[row.bulan] || row.bulan}</td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-700">{row.hari_efektif || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-700">{row.hadir || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-700">{row.tidak_absen_masuk || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-700">{row.tidak_absen_pulang || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-700">{row.terlambat || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-700">{row.pulang_awal || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-700">{row.lembur || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-700">{row.dinas || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-red-600">{row.tidak_hadir || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-600">{row.izin || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-500">{row.sakit || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm border-r border-emerald-100"><span className="font-bold text-emerald-400">{row.cuti || 0}</span></td>
                          <td className="px-2 py-2 text-center align-middle text-sm"><span className="font-bold text-gray-400">{row.belum_presensi || 0}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={14} className="px-3 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="material-icons text-4xl text-gray-300">inbox</span>
                            <span className="font-semibold text-gray-400">Tidak ada data</span>
                            <span className="text-sm text-gray-400">Tidak ada data rekap untuk tahun {tahun}</span>
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
