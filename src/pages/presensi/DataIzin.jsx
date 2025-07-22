import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";

const jenisList = ["izin", "sakit", "cuti"];

export default function DataIzin() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super_admin";

  const [jenis, setJenis] = useState("sakit");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id: null, jenis: "" });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    setLoading(true);
    setError(null);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/${jenis}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch(() => setError("Gagal mengambil data izin"))
      .finally(() => setLoading(false));
  }, [jenis, token, isSuperAdmin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.jenis.trim()) return;
    setFormLoading(true);
    const method = form.id ? "put" : "post";
    const url = form.id
      ? `${import.meta.env.VITE_API_URL}/api/${jenis}/update/${form.id}`
      : `${import.meta.env.VITE_API_URL}/api/${jenis}/create`;
    axios[method](
      url,
      { jenis: form.jenis },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(() => {
        setForm({ id: null, jenis: "" });
        Swal.fire({
          icon: "success",
          title: form.id
            ? "Berhasil update data izin"
            : "Berhasil tambah data izin",
          timer: 1200,
          showConfirmButton: false,
        });
        return axios.get(`${import.meta.env.VITE_API_URL}/api/${jenis}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => setData(res.data))
      .catch(() => {
        setError("Gagal menyimpan data izin");
        Swal.fire({ icon: "error", title: "Gagal menyimpan data izin" });
      })
      .finally(() => setFormLoading(false));
  };

  const handleEdit = (row) => {
    setForm({ id: row.id, jenis: row.jenis });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin hapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        axios
          .delete(`${import.meta.env.VITE_API_URL}/api/${jenis}/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "Data izin berhasil dihapus",
              timer: 1200,
              showConfirmButton: false,
            });
            return axios.get(`${import.meta.env.VITE_API_URL}/api/${jenis}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          })
          .then((res) => setData(res.data))
          .catch(() => {
            setError("Gagal menghapus data izin");
            Swal.fire({ icon: "error", title: "Gagal menghapus data izin" });
          })
          .finally(() => setLoading(false));
      }
    });
  };

  // Untuk admin_unit: manajemen pengajuan izin/cuti
  const [pengajuanTab, setPengajuanTab] = useState("izin"); // izin/cuti/sakit
  const [pengajuan, setPengajuan] = useState([]);
  const [loadingPengajuan, setLoadingPengajuan] = useState(false);
  const [pengajuanPagination, setPengajuanPagination] = useState({
    last_page: 1,
    current_page: 1,
    links: [],
  });
  const [pengajuanPage, setPengajuanPage] = useState(1);

  useEffect(() => {
    if (isSuperAdmin) return;
    if (loadingPengajuan === false) {
      axios
        .get(
          `${
            import.meta.env.VITE_API_URL
          }/api/pengajuan-${pengajuanTab}?page=${pengajuanPage}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => {
          setPengajuan(res.data.data);
          setPengajuanPagination({
            last_page: res.data.last_page,
            current_page: res.data.current_page,
            links: res.data.links,
          });
        })
        .catch(() => setPengajuan([]));
    }
  }, [isSuperAdmin, pengajuanTab, pengajuanPage, token, loadingPengajuan]);

  const handleApprove = (id, status) => {
    Swal.fire({
      title: status === "diterima" ? "Setujui pengajuan?" : "Tolak pengajuan?",
      input: "textarea",
      inputLabel: "Keterangan (opsional)",
      inputPlaceholder: "Tulis keterangan jika perlu...",
      showCancelButton: true,
      confirmButtonText: status === "diterima" ? "Setujui" : "Tolak",
      cancelButtonText: "Batal",
      icon: status === "diterima" ? "success" : "warning",
    }).then((result) => {
      if (result.isConfirmed) {
        setLoadingPengajuan(true);
        axios
          .post(
            `${
              import.meta.env.VITE_API_URL
            }/api/pengajuan-${pengajuanTab}/approve/${id}`,
            { status: status, keterangan_admin: result.value || "" },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(() => {
            Swal.fire({
              icon: "success",
              title: `Pengajuan ${
                status === "diterima" ? "disetujui" : "ditolak"
              }`,
              timer: 1200,
              showConfirmButton: false,
            });
            // Refresh data
            setPengajuanPage(1);
          })
          .catch(() =>
            Swal.fire({ icon: "error", title: "Gagal memproses pengajuan" })
          )
          .finally(() => setPengajuanPagination(false));
      }
    });
  };

  if (!isSuperAdmin) {
    return (
      <div className="w-full min-h-screen font-sans bg-gray-50">
        <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
          <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
            description
          </span>
          <div>
            <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
              Manajemen Pengajuan Izin/Cuti
            </div>
            <div className="text-gray-600 text-base font-medium">
              Approve/Tolak pengajuan izin sakit & cuti karyawan
            </div>
          </div>
        </div>
        <div className="mx-auto p-4 max-w-4xl flex flex-col gap-8 px-2 md:px-0">
          <div className="flex gap-2 mb-4">
            {["izin", "cuti", "sakit"].map((j) => (
              <button
                key={j}
                className={`px-4 py-2 rounded font-bold text-sm transition border ${
                  pengajuanTab === j
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setPengajuanTab(j);
                  setPengajuanPage(1);
                }}
              >
                {j.charAt(0).toUpperCase() + j.slice(1)}
              </button>
            ))}
          </div>
          <div className="border border-gray-300 bg-white p-4 rounded shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-gray-200 rounded-md overflow-hidden shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      No
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Pegawai ID
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Tanggal Mulai
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Tanggal Selesai
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Alasan
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Dokumen
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center font-bold text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pengajuan.length > 0 ? (
                    pengajuan.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-3 py-2">
                          {idx +
                            1 +
                            ((pengajuanPagination.current_page - 1) * 10 || 0)}
                        </td>
                        <td className="px-3 py-2">{row.pegawai_id}</td>
                        <td className="px-3 py-2">{row.tanggal_mulai}</td>
                        <td className="px-3 py-2">{row.tanggal_selesai}</td>
                        <td className="px-3 py-2">{row.alasan}</td>
                        <td className="px-3 py-2">
                          {row.dokumen ? (
                            <a
                              href={`${import.meta.env.VITE_API_URL}/storage/${
                                row.dokumen
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 underline"
                            >
                              Lihat
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2 capitalize font-bold">
                          {row.status}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.status === "pending" && (
                            <>
                              <button
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold mr-1"
                                onClick={() =>
                                  handleApprove(row.id, "diterima")
                                }
                              >
                                Approve
                              </button>
                              <button
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs font-bold"
                                onClick={() => handleApprove(row.id, "ditolak")}
                              >
                                Tolak
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center text-gray-400 py-4"
                      >
                        Tidak ada data pengajuan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pengajuanPagination.last_page > 1 && (
              <div className="flex flex-wrap gap-1 justify-center mt-4">
                {pengajuanPagination.links.map((link, i) => (
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
                        if (p) setPengajuanPage(Number(p));
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

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          description
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Manajemen Jenis Izin
          </div>
          <div className="text-gray-600 text-base font-medium">
            Kelola jenis izin sakit & cuti
          </div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-3xl flex flex-col gap-8 px-2 md:px-0">
        <div className="border border-gray-300 bg-white p-4 rounded shadow">
          <div className="flex gap-2 mb-4">
            {jenisList.map((j) => (
              <button
                key={j}
                className={`px-4 py-2 rounded font-bold text-sm transition border ${
                  jenis === j
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setJenis(j);
                  setForm({ id: null, jenis: "" });
                  setError(null);
                }}
              >
                {j.charAt(0).toUpperCase() + j.slice(1)}
              </button>
            ))}
          </div>
          <form className="flex gap-2 mb-4" onSubmit={handleSubmit}>
            <input
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
              placeholder="Jenis Izin"
              value={form.jenis}
              onChange={(e) =>
                setForm((f) => ({ ...f, jenis: e.target.value }))
              }
              disabled={formLoading}
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded font-bold text-sm transition ${
                form.id
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
              disabled={formLoading}
            >
              {form.id
                ? formLoading
                  ? "Menyimpan..."
                  : "Simpan Perubahan"
                : formLoading
                ? "Menambah..."
                : "Tambah"}
            </button>
            {form.id && (
              <button
                type="button"
                className="px-4 py-2 rounded font-bold text-sm bg-gray-300 hover:bg-gray-400 text-gray-700"
                onClick={() => setForm({ id: null, jenis: "" })}
                disabled={formLoading}
              >
                Batal
              </button>
            )}
          </form>
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
                      Jenis Izin
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Created
                    </th>
                    <th className="px-3 py-2 text-left font-bold text-gray-500">
                      Updated
                    </th>
                    <th className="px-3 py-2 text-center font-bold text-gray-500">
                      Aksi
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
                        <td className="px-3 py-2 font-semibold">{row.jenis}</td>
                        <td className="px-3 py-2">
                          {new Date(row.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-2">
                          {new Date(row.updated_at).toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-2 text-center flex gap-1 justify-center">
                          <button
                            className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-bold text-xs hover:bg-yellow-200"
                            onClick={() => handleEdit(row)}
                            disabled={formLoading}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-xs hover:bg-red-200"
                            onClick={() => handleDelete(row.id)}
                            disabled={formLoading}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
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
        </div>
      </div>
    </div>
  );
}
