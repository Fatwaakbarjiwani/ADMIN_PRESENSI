import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPegawai } from "../../redux/actions/pegawaiAction";
import { useNavigate } from "react-router-dom";

export default function Pegawai() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super_admin";
  const { data, pagination } = useSelector((state) => state.pegawai);
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (token) {
      dispatch(fetchPegawai(isSuperAdmin, token));
    }
  }, [token, isSuperAdmin, dispatch]);

  const handlePageChange = (page) => {
    dispatch(fetchPegawai(isSuperAdmin, token, page));
  };

  const handleSearch = (e) => {
    const newSearchValue = e.target.value;
    setSearchValue(newSearchValue);
    dispatch(fetchPegawai(isSuperAdmin, token, 1, newSearchValue));
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <div className="bg-emerald-600 p-2">
          <span className="material-icons text-white text-lg">people</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Manajemen Pegawai
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Kelola data pegawai unit
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl p-4 flex flex-col gap-8 px-2 md:px-0">
        {/* Action Bar */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/tambah-karyawan-ke-unit-detail")}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all duration-200 flex items-center gap-1 border-2 border-emerald-700 shadow-lg hover:shadow-xl"
              >
                <span className="material-icons text-sm">person_add</span>
                Tambah Pegawai
              </button>
            </div>

            {/* Search Filter */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Cari Pegawai:
              </label>
              <input
                type="text"
                placeholder="Cari Nama/NIK/Unit..."
                value={searchValue}
                onChange={handleSearch}
                className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors min-w-[250px]"
              />
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          {/* Card Header */}
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-lg text-emerald-600">
                  people
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wide">
                  Data Pegawai
                </h2>
                <p className="text-emerald-100 text-xs font-medium">
                  Kelola data pegawai unit
                </p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-hidden">
            <table className="w-full table-fixed text-xs">
              <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                <tr>
                  <th className="px-2 py-1.5 text-center font-black text-emerald-800 text-[11px] uppercase tracking-wider border-r border-emerald-200">
                    No
                  </th>
                  <th className="px-2 py-1.5 text-left font-black text-emerald-800 text-[11px] uppercase tracking-wider border-r border-emerald-200">
                    NIK
                  </th>
                  <th className="px-2 py-1.5 text-left font-black text-emerald-800 text-[11px] uppercase tracking-wider border-r border-emerald-200">
                    <div className="flex flex-col leading-tight">
                      <span>Nama Lengkap</span>
                      <span className="text-xs font-normal text-emerald-600 normal-case">
                        dengan gelar
                      </span>
                    </div>
                  </th>
                  <th className="px-2 py-1.5 text-left font-black text-emerald-800 text-[11px] uppercase tracking-wider border-r border-emerald-200">
                    No. HP
                  </th>
                  <th className="px-2 py-1.5 text-left font-black text-emerald-800 text-[11px] uppercase tracking-wider border-r border-emerald-200">
                    <div className="flex flex-col leading-tight">
                      <span>Unit</span>
                      <span className="text-xs font-normal text-emerald-600 normal-case">
                        Detail Unit
                      </span>
                    </div>
                  </th>
                  <th className="px-2 py-1.5 text-left font-black text-emerald-800 text-[11px] uppercase tracking-wider border-r border-emerald-200">
                    Tempat Lahir
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                    Tanggal Lahir
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                    Jenis Kelamin
                  </th>
                  <th className="px-2 py-1.5 text-left font-black text-emerald-800 text-[11px] uppercase tracking-wider">
                    Shift
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.length > 0 ? (
                  data?.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`transition-all duration-200 hover:bg-emerald-50 border-b border-emerald-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                      }`}
                    >
                      <td className="px-2 py-1.5 text-center font-bold text-emerald-700 border-r border-emerald-100">
                        {idx + 1 + (pagination.current_page - 1) * 20}
                      </td>
                      <td className="px-2 py-1.5 font-semibold text-gray-800 border-r border-emerald-100 break-words">
                        {row.no_ktp}
                      </td>
                      <td className="px-2 py-1.5 font-bold text-emerald-800 border-r border-emerald-100 break-words leading-snug">
                        {row.nama}
                      </td>
                      <td className="px-2 py-1.5 text-gray-700 border-r border-emerald-100 break-words">
                        {row.no_hp}
                      </td>
                      <td className="px-2 py-1.5 border-r border-emerald-100 break-words">
                        {row?.nama_unit ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {row.nama_unit}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-400 border border-gray-300">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-gray-700 border-r border-emerald-100">
                        {row.tmpt_lahir}
                      </td>
                      <td className="px-2 py-1.5 text-gray-700 border-r border-emerald-100">
                        {row.tgl_lahir}
                      </td>
                      <td className="px-2 py-1.5 border-r border-emerald-100">
                        {row.jenis_kelamin === "l" ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            Laki-laki
                          </span>
                        ) : row.jenis_kelamin === "p" ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-pink-100 text-pink-800 border border-pink-300">
                            Perempuan
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-400 border border-gray-300">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        {row?.nama_shift ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {row.nama_shift}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-400 border border-gray-300">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <span className="material-icons text-6xl text-gray-300">
                          people
                        </span>
                        <div className="text-gray-500 font-bold text-lg">
                          Tidak ada data pegawai
                        </div>
                        <div className="text-gray-400 text-sm">
                          Belum ada data pegawai yang tersedia
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="bg-emerald-50 border-t-2 border-emerald-200 px-6 py-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {pagination.links.map((link, i) => (
                  <button
                    key={i}
                    className={`px-4 py-2 font-bold text-sm border-2 transition-all duration-200 ${
                      link.active
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-lg"
                        : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400"
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
