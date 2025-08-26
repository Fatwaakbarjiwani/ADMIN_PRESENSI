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
        <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
          {/* Tab Navigation - Modern Style */}
          <div className="flex border-b border-gray-200 bg-white shadow-sm">
            {["izin", "cuti", "sakit"].map((j) => (
              <button
                key={j}
                className={`px-6 py-3 font-semibold text-sm transition-colors ${
                  pengajuanTab === j
                    ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                    : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setPengajuanTab(j);
                  setPengajuanPage(1);
                }}
              >
                <span className="material-icons text-lg mr-2">
                  {j === "izin"
                    ? "event_note"
                    : j === "cuti"
                    ? "event"
                    : "healing"}
                </span>
                {j.charAt(0).toUpperCase() + j.slice(1)}
              </button>
            ))}
          </div>

          <div className="border border-gray-200 bg-white p-6 shadow flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold text-emerald-600 text-xl flex items-center gap-2">
                <span className="material-icons text-emerald-600 text-2xl">
                  {pengajuanTab === "izin"
                    ? "event_note"
                    : pengajuanTab === "cuti"
                    ? "event"
                    : "healing"}
                </span>
                DATA PENGAJUAN {pengajuanTab.toUpperCase()}
              </div>
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded flex items-center gap-2 transition shadow-md hover:shadow-lg"
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
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm bg-white">
                <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                  <tr>
                    <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-12">
                      No
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                      Pegawai ID
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                      Tanggal Mulai
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                      Tanggal Selesai
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                      Alasan
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                      Dokumen
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-24">
                      Status
                    </th>
                    <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-24">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pengajuan.length > 0 ? (
                    pengajuan.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={
                          "transition hover:bg-emerald-50 " +
                          (idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                        }
                      >
                        <td className="px-4 py-4 text-center align-middle border-b border-gray-100 font-semibold text-sm">
                          {idx +
                            1 +
                            ((pengajuanPagination.current_page - 1) * 10 || 0)}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                          {row.pegawai_id}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                          {row.tanggal_mulai}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                          {row.tanggal_selesai}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                          {row.alasan}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100">
                          {row.dokumen ? (
                            <a
                              href={`http://103.23.103.43/prototype/tes/storage/${row.dokumen}`}
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
                        <td className="px-4 py-4 capitalize font-bold align-middle border-b border-gray-100 text-sm">
                          {row.status === "pending" && (
                            <span className="text-yellow-500">Pending</span>
                          )}
                          {row.status === "diterima" && (
                            <span className="text-emerald-500">Diterima</span>
                          )}
                          {row.status === "ditolak" && (
                            <span className="text-red-500">Ditolak</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center align-middle border-b border-gray-100 flex gap-1 justify-center text-sm">
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
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        {/* Tab Navigation - Modern Style */}
        <div className="flex border-b border-gray-200 bg-white shadow-sm">
          {jenisList.map((j) => (
            <button
              key={j}
              className={`px-6 py-3 font-semibold text-sm transition-colors ${
                jenis === j
                  ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                  : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
              }`}
              onClick={() => {
                setJenis(j);
                setForm({ id: null, jenis: "" });
                // setError(null);
              }}
            >
              <span className="material-icons text-lg mr-2">
                {j === "izin"
                  ? "event_note"
                  : j === "cuti"
                  ? "event"
                  : "healing"}
              </span>
              {j.charAt(0).toUpperCase() + j.slice(1)}
            </button>
          ))}
        </div>

        <div className="border border-gray-200 bg-white p-6 shadow flex flex-col gap-4">
          <div className="font-bold text-emerald-600 text-xl flex items-center gap-2 mb-2">
            <span className="material-icons text-emerald-600 text-2xl">
              {jenis === "izin"
                ? "event_note"
                : jenis === "cuti"
                ? "event"
                : "healing"}
            </span>
            DATA JENIS {jenis.toUpperCase()}
          </div>
          <form
            className="flex flex-wrap gap-4 mb-4 items-end"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-gray-600 mb-1">
                Jenis {jenis.charAt(0).toUpperCase() + jenis.slice(1)}
              </label>
              <input
                className="border border-gray-300 px-3 py-2 text-sm"
                placeholder={`Jenis ${
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
            <div className="flex flex-col justify-end min-w-[120px]">
              <button
                type="submit"
                className={`px-4 py-2 font-bold text-sm transition flex items-center gap-2 ${
                  form.id
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
                disabled={formLoading}
              >
                {formLoading && (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                )}
                {form.id
                  ? formLoading
                    ? "Menyimpan..."
                    : "Simpan Perubahan"
                  : formLoading
                  ? "Menambah..."
                  : "Tambah"}
              </button>
            </div>
            {form.id && (
              <div className="flex flex-col justify-end min-w-[80px]">
                <button
                  type="button"
                  className="px-4 py-2 font-bold text-sm bg-gray-300 hover:bg-gray-400 text-gray-700"
                  onClick={() => setForm({ id: null, jenis: "" })}
                  disabled={formLoading}
                >
                  Batal
                </button>
              </div>
            )}
          </form>
          {form.id && (
            <div className="mb-2 text-sm text-yellow-700 font-semibold">
              Edit {jenis.charAt(0).toUpperCase() + jenis.slice(1)}:{" "}
              {form.jenis}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white">
              <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                <tr>
                  <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-12">
                    No
                  </th>
                  <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                    Jenis {jenis.charAt(0).toUpperCase() + jenis.slice(1)}
                  </th>
                  <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                    Created
                  </th>
                  <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                    Updated
                  </th>
                  <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-24">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={
                        "transition hover:bg-emerald-50 " +
                        (idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                      }
                    >
                      <td className="px-4 py-4 text-center align-middle border-b border-gray-100 font-semibold text-base">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-base">
                        {row.jenis}
                      </td>
                      <td className="px-4 py-4 align-middle border-b border-gray-100 text-base">
                        {new Date(row.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4 align-middle border-b border-gray-100 text-base">
                        {new Date(row.updated_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-4 text-center align-middle border-b border-gray-100 flex gap-1 justify-center text-base">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-yellow-600 hover:text-yellow-800 rounded transition"
                          onClick={() => handleEdit(row)}
                          disabled={formLoading}
                          title="Edit"
                        >
                          <span className="material-icons text-base">edit</span>
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 rounded transition"
                          onClick={() => handleDelete(row.id)}
                          disabled={formLoading}
                          title="Hapus"
                        >
                          <span className="material-icons text-base">
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-4">
                      Tidak ada data ditemukan.
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
