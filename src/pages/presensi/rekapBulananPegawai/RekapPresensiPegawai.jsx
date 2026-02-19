import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPegawai } from "../../../redux/actions/pegawaiAction";
import { useNavigate } from "react-router-dom";

export default function RekapPresensiPegawai() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const pegawai = useSelector((state) => state.pegawai.data);
  const pegawaiLoading = useSelector((state) => state.pegawai.loading);
  const pegawaiPagination = useSelector((state) => state.pegawai.pagination);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (token) {
      dispatch(
        fetchPegawai(
          user?.role === "super_admin",
          token,
          currentPage,
          searchValue
        )
      );
    }
  }, [dispatch, token, user, currentPage, searchValue]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    return pegawaiPagination.links.map((link, i) => (
      <button
        key={i}
        className={`px-3 py-1 text-xs font-bold border transition ${
          link.active
            ? "bg-emerald-600 text-white border-emerald-600"
            : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-100"
        }`}
        onClick={() => {
          if (link.url) {
            const url = new URL(link.url);
            const p = url.searchParams.get("page");
            if (p) handlePageChange(Number(p));
          }
        }}
        disabled={!link.url || link.active}
        dangerouslySetInnerHTML={{ __html: link.label }}
      />
    ));
  };

  return (
    <>
      <div className="bg-white border-2 border-emerald-200 shadow-lg p-4 mb-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="material-icons text-emerald-600">
                calendar_today
              </span>
              <label className="text-sm font-semibold text-gray-700">
                Tahun:
              </label>
              <input
                type="number"
                className="border border-gray-300 px-3 py-2 text-sm w-24"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                min="2000"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="material-icons">people</span>
              <span className="font-semibold">
                Total Pegawai: {pegawai?.length || 0}
              </span>
            </div>
          </div>
          <div>
            <span className="text-gray-400">
              <span className="text-xs">search :</span>
            </span>
            <div className="relative bg-white flex items-center">
              <input
                type="text"
                placeholder="Cari Nama/NIK/Unit"
                className="p-2 w-full rounded border-2 border-emerald-300 focus:border-emerald-500 outline-none text-sm"
                value={searchValue}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>
      {pegawaiLoading ? (
        <div className="text-center py-12 text-emerald-600 font-bold flex items-center justify-center gap-2">
          <span className="material-icons animate-spin">refresh</span>
          Memuat data pegawai...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[100%] text-xs border border-gray-400 overflow-hidden shadow-lg">
            <thead className="sticky top-0 z-10 bg-gray-600">
              <tr>
                <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider w-12">
                  <span className="material-icons text-base">
                    format_list_numbered
                  </span>
                </th>
                <th className="px-3 py-2.5 text-left font-bold text-white text-xs uppercase tracking-wider w-32">
                  NIK
                </th>
                <th className="px-3 py-2.5 text-left font-bold text-white text-xs uppercase tracking-wider w-56">
                  Nama Pegawai
                </th>
                <th className="px-3 py-2.5 text-left font-bold text-white text-xs uppercase tracking-wider w-40">
                  Unit Kerja
                </th>
                <th className="px-3 py-2.5 text-left font-bold text-white text-xs uppercase tracking-wider w-40 border-r border-gray-500">
                  Shift
                </th>
                <th className="px-3 py-2.5 text-left font-bold text-white text-xs uppercase tracking-wider w-40 border-r border-gray-500">
                  Lokasi
                </th>
                <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider w-40 border-r border-gray-500">
                  <div className="flex flex-col leading-tight">
                    <span>REKAP BULANAN</span>
                    <span className="text-xs font-normal text-gray-200 normal-case">
                      Presensi Bulanan Pegawai
                    </span>
                  </div>
                </th>
                <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider w-40 border-r border-gray-500">
                  <div className="flex flex-col leading-tight">
                    <span>PRESENSI</span>
                    <span className="text-xs font-normal text-gray-200 normal-case">
                      History Presensi Pegawai
                    </span>
                  </div>
                </th>
                <th className="px-3 py-2.5 text-center font-bold text-white text-xs uppercase tracking-wider w-40">
                  <div className="flex flex-col leading-tight">
                    <span>KEHADIRAN</span>
                    <span className="text-xs font-normal text-gray-200 normal-case">
                      Laporan Kehadiran Pegawai
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {pegawai?.length > 0 ? (
                pegawai.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`transition hover:bg-primary/10 border-b border-gray-100 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-3 py-2 text-center align-middle font-semibold">
                      {idx + 1 + (pegawaiPagination.current_page - 1) * 20}
                    </td>
                    <td className="px-3 py-2 align-middle">{row.no_ktp}</td>
                    <td className="px-3 py-2 align-middle font-bold text-emerald-800">
                      {row.nama}
                    </td>
                    <td className="px-3 py-2 align-middle font-bold text-emerald-700">
                      {row?.nama_unit || "-"}
                    </td>
                    <td className="px-3 py-2 align-middle font-bold text-emerald-700">
                      {row?.nama_shift || "-"}
                    </td>
                    <td className="px-3 py-2 align-middle font-bold text-emerald-700">
                      {row?.nama_lokasi_presensi || "-"}
                    </td>
                    <td className="px-3 py-2 text-center align-middle">
                      <button
                        className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition"
                        title="Lihat Detail Rekap Bulanan"
                        onClick={() =>
                          navigate(
                            `/presensi/rekap-bulanan-pegawai/${row.id}?tahun=${tahun}`
                          )
                        }
                      >
                        <span className="material-icons text-sm">
                          visibility
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center align-middle">
                      <button
                        className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 border border-blue-200 transition"
                        title="Lihat Rekap Presensi"
                        onClick={() =>
                          navigate(
                            `/presensi/detail-history-presensi/${row.id}/${row.unit_id_presensi}`
                          )
                        }
                      >
                        <span className="material-icons text-sm">history</span>
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center align-middle">
                      <button
                        className="w-8 h-8 flex items-center justify-center text-orange-600 hover:bg-orange-50 border border-orange-200 transition"
                        title="Lihat Laporan Kehadiran"
                        onClick={() =>
                          navigate(`/presensi/laporan-kehadiran/${row.id}`)
                        }
                      >
                        <span className="material-icons text-sm">
                          assessment
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center text-gray-400 py-8">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-icons text-4xl text-gray-300">
                        people_outline
                      </span>
                      <span className="font-semibold">
                        Tidak ada data pegawai
                      </span>
                      <span className="text-sm">Data pegawai kosong</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {pegawaiPagination && pegawaiPagination.last_page > 1 && (
            <div className="flex flex-wrap gap-1 justify-center mt-6">
              {renderPaginationButtons()}
            </div>
          )}
        </div>
      )}
    </>
  );
}
