import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Logo ybwsa base64 PNG (dummy, ganti dengan logo asli jika ada)
const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC..."; // Potong, ganti dengan base64 logo asli jika ada

const jenisList = ["izin", "sakit", "cuti"];

export default function DataIzin() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super_admin";

  const [jenis, setJenis] = useState("sakit");
  const [data, setData] = useState([]);
  // const [error, setError] = useState(null);
  const [form, setForm] = useState({ id: null, jenis: "" });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (token) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/${jenis}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setData(res.data));
      // .catch(() => setError("Gagal mengambil data izin"));
    }
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
        // setError("Gagal menyimpan data izin");
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
            // setError("Gagal menghapus data izin");
            Swal.fire({ icon: "error", title: "Gagal menghapus data izin" });
          });
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
          .finally(() => setLoadingPengajuan(false));
      }
    });
  };

  // Function to download PDF for admin_unit
  const downloadPDF = () => {
    if (!pengajuan || pengajuan.length === 0) return;

    const doc = new jsPDF("p", "mm", "a4"); // portrait A4

    // Logo (opsional)
    try {
      doc.addImage(logoBase64, "PNG", 10, 10, 25, 25);
    } catch {
      // kalau logo gagal dimuat, lanjutkan
    }

    // Header
    doc.setFontSize(16);
    doc.text("YAYASAN BADAN WAKAF SULTAN AGUNG", 105, 20, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(
      "Jl.Raya Kaligawe Km.4 Semarang 50112; PO Box 1054/SM Indonesia",
      105,
      28,
      { align: "center" }
    );
    doc.text("Telp (024) 6583584 Fax. (024) 6582455", 105, 34, {
      align: "center",
    });
    doc.text(
      "Email : informasi@ybwsa.ac.id Homepage : http://ybwsa.ac.id",
      105,
      40,
      { align: "center" }
    );

    // Garis bawah
    doc.setLineWidth(0.5);
    doc.line(10, 44, 200, 44);

    // Judul laporan
    doc.setFontSize(12);
    doc.text(`LAPORAN REKAP PENGAJUAN ${pengajuanTab.toUpperCase()}`, 105, 55, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 20, 65);
    doc.text(`Total Data: ${pengajuan.length} pengajuan`, 20, 72);
    doc.text(`Dibuat oleh: ${user?.name || "Admin Unit"}`, 20, 79);

    // Tabel pengajuan
    autoTable(doc, {
      startY: 85,
      head: [
        [
          "NO",
          "Pegawai ID",
          "Nama Pegawai",
          "Tanggal Mulai",
          "Tanggal Selesai",
          "Alasan",
          "Status",
          "Aksi",
        ],
      ],
      body: pengajuan.map((row, idx) => [
        idx + 1,
        row.pegawai_id || "-",
        row.nama_pegawai || row.pegawai?.nama || "-",
        row.tanggal_mulai || "-",
        row.tanggal_selesai || "-",
        row.alasan || "-",
        row.status === "pending"
          ? "Pending"
          : row.status === "diterima"
          ? "Diterima"
          : row.status === "ditolak"
          ? "Ditolak"
          : "-",
        "", // Empty column for checkbox
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [22, 160, 133], // hijau emerald (sama dengan history)
        halign: "center",
        fontStyle: "bold",
        fontSize: 10,
        textColor: [255, 255, 255],
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0],
      },
      styles: {
        cellPadding: 2,
        font: "helvetica",
      },
      margin: { left: 10, right: 10 },
      tableWidth: "auto",
    });

    // Simpan PDF
    doc.save(
      `laporan-pengajuan-${pengajuanTab}-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  if (!isSuperAdmin) {
    return (
      <div className="w-full min-h-screen font-sans bg-gray-50">
        <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
          <div className="bg-emerald-600 p-2">
            <span className="material-icons text-white text-lg">description</span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
              Manajemen Pengajuan Izin/Cuti/Sakit
            </div>
            <div className="text-emerald-600 text-sm font-medium">
              Kelola data pengajuan izin/cuti/sakit
            </div>
          </div>
        </div>
        <div className="mx-auto p-6 max-w-5xl flex flex-col gap-6">
          {/* Tab Navigation - Enhanced Design */}
          <div className="bg-white border-2 border-emerald-200 shadow-lg">
            <div className="flex">
              {["izin", "cuti", "sakit"].map((j) => (
                <button
                  key={j}
                  className={`flex-1 px-4 py-2 font-semibold text-sm transition-all duration-200 border-r-2 border-emerald-200 last:border-r-0 ${
                    pengajuanTab === j
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                  onClick={() => {
                    setPengajuanTab(j);
                    setPengajuanPage(1);
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="material-icons text-lg">
                      {j === "izin"
                        ? "event_note"
                        : j === "cuti"
                        ? "event"
                        : "healing"}
                    </span>
                    <span className="uppercase tracking-wide">
                      {j.charAt(0).toUpperCase() + j.slice(1)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white border-2 border-emerald-200 shadow-lg">
            {/* Card Header */}
            <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2">
                    <span className="material-icons text-lg text-emerald-600">
                      {pengajuanTab === "izin"
                        ? "event_note"
                        : pengajuanTab === "cuti"
                        ? "event"
                        : "healing"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wide">
                      Data Pengajuan {pengajuanTab.toUpperCase()}
                    </h2>
                    <p className="text-emerald-100 text-xs font-medium">
                      Kelola pengajuan {pengajuanTab} karyawan
                    </p>
                  </div>
                </div>
                <button
                  onClick={downloadPDF}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 px-4 py-2 font-bold text-xs border-2 border-emerald-300 flex items-center gap-1 transition-all duration-200 shadow-lg hover:shadow-xl"
                  title={`Download PDF Rekap Pengajuan ${
                    pengajuanTab.charAt(0).toUpperCase() + pengajuanTab.slice(1)
                  }`}
                  disabled={pengajuan.length === 0}
                >
                  <span className="material-icons text-sm">picture_as_pdf</span>
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              </div>
            </div>
            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                  <tr>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      No
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Pegawai ID
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Nama Pegawai
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Tanggal Mulai
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Tanggal Selesai
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Alasan
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Dokumen
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pengajuan.length > 0 ? (
                    pengajuan.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`transition-all duration-200 hover:bg-emerald-50 border-b border-emerald-100 ${
                          idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                        }`}
                      >
                        <td className="px-3 py-2 text-center font-bold text-emerald-700 border-r border-emerald-100 text-sm">
                          {idx +
                            1 +
                            ((pengajuanPagination.current_page - 1) * 10 || 0)}
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-800 border-r border-emerald-100 text-sm">
                          {row.pegawai_id}
                        </td>
                        <td className="px-3 py-2 font-bold text-emerald-800 border-r border-emerald-100 text-sm">
                          {row.nama}
                        </td>
                        <td className="px-3 py-2 text-gray-700 border-r border-emerald-100 text-sm">
                          {row.tanggal_mulai}
                        </td>
                        <td className="px-3 py-2 text-gray-700 border-r border-emerald-100 text-sm">
                          {row.tanggal_selesai}
                        </td>
                        <td className="px-3 py-2 text-gray-600 border-r border-emerald-100 text-sm">
                          {row.alasan}
                        </td>
                        <td className="px-3 py-2 text-center border-r border-emerald-100">
                          {row.dokumen ? (
                            <a
                              href={`${import.meta.env.VITE_API_URL}/${
                                row.dokumen
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                            >
                              <span className="material-icons text-sm">
                                visibility
                              </span>
                              Lihat
                            </a>
                          ) : (
                            <span className="text-gray-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center border-r border-emerald-100">
                          {row.status === "pending" && (
                            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 font-bold text-xs border border-yellow-300">
                              <span className="material-icons text-xs mr-1">
                                schedule
                              </span>
                              Pending
                            </span>
                          )}
                          {row.status === "diterima" && (
                            <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                              <span className="material-icons text-xs mr-1">
                                check_circle
                              </span>
                              Diterima
                            </span>
                          )}
                          {row.status === "ditolak" && (
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 font-bold text-xs border border-red-300">
                              <span className="material-icons text-xs mr-1">
                                cancel
                              </span>
                              Ditolak
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.status === "pending" && (
                            <div className="flex gap-1 justify-center">
                              <button
                                className="px-2 py-1 bg-emerald-600 text-white font-bold text-xs border border-emerald-700 hover:bg-emerald-700 transition-all duration-200"
                                onClick={() =>
                                  handleApprove(row.id, "diterima")
                                }
                              >
                                <span className="material-icons text-xs mr-1">
                                  check
                                </span>
                                Approve
                              </button>
                              <button
                                className="px-2 py-1 bg-red-500 text-white font-bold text-xs border border-red-600 hover:bg-red-600 transition-all duration-200"
                                onClick={() => handleApprove(row.id, "ditolak")}
                              >
                                <span className="material-icons text-xs mr-1">
                                  close
                                </span>
                                Tolak
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-icons text-6xl text-gray-300">
                            inbox
                          </span>
                          <div className="text-gray-500 font-bold text-lg">
                            Tidak ada data pengajuan
                          </div>
                          <div className="text-gray-400 text-sm">
                            Belum ada pengajuan {pengajuanTab} yang perlu
                            diproses
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {pengajuanPagination.last_page > 1 && (
              <div className="bg-emerald-50 border-t-2 border-emerald-200 px-6 py-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {pengajuanPagination.links.map((link, i) => (
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
                          if (p) setPengajuanPage(Number(p));
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

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <div className="bg-emerald-600 p-2">
          <span className="material-icons text-white text-lg">description</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Manajemen Jenis Izin/Cuti/Sakit
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Kelola data jenis izin/cuti/sakit
          </div>
        </div>
      </div>
      <div className="mx-auto p-6 max-w-7xl flex flex-col gap-6">
        {/* Tab Navigation - Enhanced Design */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          <div className="flex">
            {jenisList.map((j) => (
              <button
                key={j}
                className={`flex-1 px-4 py-2 font-semibold text-sm transition-all duration-200 border-r-2 border-emerald-200 last:border-r-0 ${
                  jenis === j
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
                onClick={() => {
                  setJenis(j);
                  setForm({ id: null, jenis: "" });
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="material-icons text-lg">
                    {j === "izin"
                      ? "event_note"
                      : j === "cuti"
                      ? "event"
                      : "healing"}
                  </span>
                  <span className="uppercase tracking-wide">
                    {j.charAt(0).toUpperCase() + j.slice(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          {/* Card Header */}
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-lg text-emerald-600">
                  {jenis === "izin"
                    ? "event_note"
                    : jenis === "cuti"
                    ? "event"
                    : "healing"}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wide">
                  Data Jenis {jenis.toUpperCase()}
                </h2>
                <p className="text-emerald-100 text-xs font-medium">
                  Kelola jenis {jenis} yang tersedia
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-4 border-b-2 border-emerald-200">
            <form
              className="flex flex-wrap gap-3 items-end"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col flex-1 min-w-[250px]">
                <label className="text-xs font-bold text-emerald-700 mb-1 uppercase tracking-wide">
                  Jenis {jenis.charAt(0).toUpperCase() + jenis.slice(1)}
                </label>
                <input
                  className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder={`Masukkan jenis ${
                    jenis.charAt(0).toUpperCase() + jenis.slice(1)
                  }`}
                  value={form.jenis}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jenis: e.target.value }))
                  }
                  disabled={formLoading}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className={`px-4 py-2 font-bold text-xs transition-all duration-200 flex items-center gap-1 border-2 shadow-lg hover:shadow-xl ${
                    form.id
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                  }`}
                  disabled={formLoading}
                >
                  {formLoading && (
                    <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent"></span>
                  )}
                  <span className="material-icons text-sm">
                    {form.id ? "save" : "add"}
                  </span>
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
                    className="px-4 py-2 font-bold text-xs bg-gray-500 hover:bg-gray-600 text-white border-2 border-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => setForm({ id: null, jenis: "" })}
                    disabled={formLoading}
                  >
                    <span className="material-icons text-sm mr-1">close</span>
                    Batal
                  </button>
                )}
              </div>
            </form>
            {form.id && (
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300">
                <div className="flex items-center gap-1">
                  <span className="material-icons text-yellow-600 text-sm">
                    edit
                  </span>
                  <span className="text-yellow-800 font-bold text-xs">
                    Sedang mengedit: {form.jenis}
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                <tr>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                    No
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                    Jenis {jenis.charAt(0).toUpperCase() + jenis.slice(1)}
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                    Dibuat
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                    Diperbarui
                  </th>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`transition-all duration-200 hover:bg-emerald-50 border-b border-emerald-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                      }`}
                    >
                      <td className="px-3 py-2 text-center font-bold text-emerald-700 border-r border-emerald-100 text-sm">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 font-bold text-emerald-800 border-r border-emerald-100 text-sm">
                        {row.jenis}
                      </td>
                      <td className="px-3 py-2 text-gray-700 border-r border-emerald-100 text-sm">
                        {new Date(row.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2 text-gray-700 border-r border-emerald-100 text-sm">
                        {new Date(row.updated_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 border border-yellow-300 transition-all duration-200"
                            onClick={() => handleEdit(row)}
                            disabled={formLoading}
                            title="Edit"
                          >
                            <span className="material-icons text-sm">edit</span>
                          </button>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-100 border border-red-300 transition-all duration-200"
                            onClick={() => handleDelete(row.id)}
                            disabled={formLoading}
                            title="Hapus"
                          >
                            <span className="material-icons text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <span className="material-icons text-6xl text-gray-300">
                          inbox
                        </span>
                        <div className="text-gray-500 font-bold text-lg">
                          Tidak ada data ditemukan
                        </div>
                        <div className="text-gray-400 text-sm">
                          Belum ada jenis {jenis} yang tersedia
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
