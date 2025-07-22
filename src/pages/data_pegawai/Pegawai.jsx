import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

export default function Pegawai() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super_admin";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    last_page: 1,
    current_page: 1,
    links: [],
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = "";
    if (isSuperAdmin) {
      url = `${import.meta.env.VITE_API_URL}/api/pegawai?page=${page}`;
    } else {
      url = `${import.meta.env.VITE_API_URL}/api/pegawai/by-unit-id-presensi`;
    }
    axios
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (isSuperAdmin) {
          setData(res.data.data);
          setPagination({
            last_page: res.data.last_page,
            current_page: res.data.current_page,
            links: res.data.links,
          });
        } else {
          setData(res.data);
        }
      })
      .catch(() => setError("Gagal mengambil data pegawai"))
      .finally(() => setLoading(false));
  }, [token, isSuperAdmin, page]);

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
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        <div className="border border-gray-300 bg-white p-4 rounded shadow">
          {loading ? (
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
                      NIK
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Nama
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Unit
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Tanggal Lahir
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Jenis Kelamin
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
                        <td className="px-3 py-2">
                          {idx + 1 + (pagination.current_page - 1) * 20}
                        </td>
                        <td className="px-3 py-2">{row.no_ktp}</td>
                        <td className="px-3 py-2 font-semibold">
                          {[
                            row.gelar_depan,
                            row.nama_depan,
                            row.nama_tengah,
                            row.nama_belakang,
                            row.gelar_belakang,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </td>
                        <td className="px-3 py-2">{row.email}</td>
                        <td className="px-3 py-2">
                          {row.unit_detail?.nama || "-"}
                        </td>
                        <td className="px-3 py-2">{row.tgl_lahir}</td>
                        <td className="px-3 py-2">
                          {row.jenis_kelamin === "l"
                            ? "Laki-laki"
                            : row.jenis_kelamin === "p"
                            ? "Perempuan"
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-gray-400 py-4"
                      >
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {isSuperAdmin && pagination.last_page > 1 && (
            <div className="flex flex-wrap gap-1 justify-center mt-4">
              {pagination.links.map((link, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded text-xs font-bold border transition ${
                    link.active
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    if (link.url) {
                      const url = new URL(link.url);
                      const p = url.searchParams.get("page");
                      if (p) setPage(Number(p));
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
