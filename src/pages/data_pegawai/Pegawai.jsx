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
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          people
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Manajemen Pegawai
          </div>
          <div className="text-gray-600 text-base font-medium">
            Kelola data pegawai unit
          </div>
        </div>
      </div>
      <div className="mx-auto py-6 max-w-6xl px-4">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/tambah-karyawan-ke-unit-detail")}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center gap-2"
            >
              <span className="material-icons text-base">person_add</span>
              Tambah Pegawai
            </button>
          </div>

          {/* Search Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">
              Cari Pegawai:
            </label>
            <input
              type="text"
              placeholder="Cari Nama/NIK/Unit..."
              value={searchValue}
              onChange={handleSearch}
              className="border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-w-[250px]"
            />
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-white border border-gray-200 shadow-sm">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="material-icons text-emerald-600 text-xl">
                people
              </span>
              <h2 className="text-lg font-semibold text-gray-800">
                Data Pegawai
              </h2>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-12">
                    No
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">
                    NIK
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-56">
                    <div className="flex flex-col leading-tight">
                      <span>Nama Lengkap</span>
                      <span className="text-xs font-normal text-gray-400 normal-case">
                        dengan gelar
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-48">
                    No. HP
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-40">
                    <div className="flex flex-col leading-tight">
                      <span>Unit</span>
                      <span className="text-xs font-normal text-gray-400 normal-case">
                        Detail Unit
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">
                    Tempat Lahir
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">
                    Tanggal Lahir
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">
                    Jenis Kelamin
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-32">
                    Shift
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.length > 0 ? (
                  data?.map((row, idx) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-center text-gray-600 font-medium">
                        {idx + 1 + (pagination.current_page - 1) * 20}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.no_ktp}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {row.nama}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.no_hp}</td>
                      <td className="px-4 py-3">
                        {row?.nama_unit ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700">
                            {row.nama_unit}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-400">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.tmpt_lahir}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {row.tgl_lahir}
                      </td>
                      <td className="px-4 py-3">
                        {row.jenis_kelamin === "l" ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                            Laki-laki
                          </span>
                        ) : row.jenis_kelamin === "p" ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-pink-100 text-pink-700">
                            Perempuan
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-400">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row?.nama_shift ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700">
                            {row.nama_shift}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-400">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-400 py-8">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-icons text-4xl text-gray-300">
                          people
                        </span>
                        <div className="font-semibold text-gray-600">
                          Tidak ada data pegawai.
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
            <div className="flex flex-wrap gap-1 justify-center p-4 bg-gray-50 border-t border-gray-200">
              {pagination.links.map((link, i) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
