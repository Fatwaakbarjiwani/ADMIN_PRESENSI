import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPresensiHistoryByUnit } from "../../redux/actions/presensiAction";
import { fetchPegawai } from "../../redux/actions/pegawaiAction";
import {
  fetchLaukPauk,
  createLaukPauk,
  updateLaukPauk,
  deleteLaukPauk,
} from "../../redux/actions/laukPaukAction";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

// Logo Unissula base64 PNG (dummy, ganti dengan logo asli jika ada)
const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC..."; // Potong, ganti dengan base64 logo asli jika ada

export default function RekapPresensiBulanan() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.presensi.data);
  const loading = useSelector((state) => state.presensi.loading);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const pegawai = useSelector((state) => state.pegawai.data);
  const pegawaiLoading = useSelector((state) => state.pegawai.loading);
  const pegawaiPagination = useSelector((state) => state.pegawai.pagination);
  const token = useSelector((state) => state.auth.token);
  const [tab, setTab] = useState("history");
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);

  // State untuk rekap lauk pauk
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahunLaukPauk, setTahunLaukPauk] = useState(new Date().getFullYear());
  const [rekapLaukPauk, setRekapLaukPauk] = useState([]);
  const [loadingLaukPauk, setLoadingLaukPauk] = useState(false);

  // State untuk setting lauk pauk
  const laukPaukData = useSelector((state) => state.laukPauk.data);
  const laukPaukLoading = useSelector((state) => state.laukPauk.loading);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nominal: "",
  });
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (user !== null) {
      dispatch(fetchPresensiHistoryByUnit());
    }
  }, [dispatch, user]);

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
  }, [token, user, currentPage, searchValue]);

  useEffect(() => {
    if (token && tab === "laukPauk") {
      dispatch(fetchLaukPauk());
    }
  }, [token, tab, dispatch]);

  // Fungsi untuk handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  // Fungsi untuk render pagination buttons
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

  // Fungsi untuk handle form lauk pauk
  const handleLaukPaukSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateLaukPauk(editingId, parseInt(formData.nominal)));
    } else {
      dispatch(createLaukPauk(parseInt(formData.nominal)));
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ nominal: "" });
  };

  const handleEditLaukPauk = (data) => {
    setEditingId(data.id);
    setFormData({ nominal: data.nominal.toString() });
    setShowForm(true);
  };

  const handleDeleteLaukPauk = (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data lauk pauk akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteLaukPauk(id));
      }
    });
  };

  // Fungsi export PDF untuk tab history
  const handleDownloadHistoryPDF = () => {
    const doc = new jsPDF("l", "mm", "a4"); // landscape, mm, A4
    // Logo kiri atas
    try {
      doc.addImage(logoBase64, "PNG", 10, 10, 25, 25);
    } catch {
      // logo gagal dimuat, lanjutkan tanpa logo
    }
    // Judul dan alamat
    doc.setFontSize(16);
    doc.text("UNIVERSITAS ISLAM SULTAN AGUNG SEMARANG", 148, 20, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(
      "Jl.Raya Kaligawe Km.4 Semarang 50112; PO Box 1054/SM Indonesia",
      148,
      28,
      { align: "center" }
    );
    doc.text("Telp (024) 6583584 Fax. (024) 6582455", 148, 34, {
      align: "center",
    });
    doc.text(
      "Email : informasi@unissula.ac.id Homepage : http://unissula.ac.id",
      148,
      40,
      { align: "center" }
    );
    // Garis bawah
    doc.setLineWidth(0.5);
    doc.line(10, 44, 287, 44);
    // Tabel
    autoTable(doc, {
      startY: 50,
      head: [["No", "No KTP", "Nama", "Status", "Waktu", "Keterangan"]],
      body: data.map((row, idx) => [
        idx + 1,
        row.no_ktp,
        row.nama,
        row.status,
        new Date(row.waktu).toLocaleString("id-ID"),
        row.keterangan || "-",
      ]),
      headStyles: {
        fillColor: [22, 160, 133],
        halign: "center",
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: { fontSize: 9 },
      styles: { cellPadding: 2, font: "helvetica" },
      margin: { left: 10, right: 10 },
      tableWidth: "auto",
    });
    doc.save("history-presensi-unissula.pdf");
  };

  const bulanOptions = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  // Fetch rekap lauk pauk
  const fetchRekapLaukPauk = async () => {
    setLoadingLaukPauk(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/presensi/rekap-bulanan-semua-pegawai?bulan=${bulan}&tahun=${tahunLaukPauk}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setRekapLaukPauk(data);
    } catch (error) {
      console.error("Gagal mengambil data rekap lauk pauk:", error);
    } finally {
      setLoadingLaukPauk(false);
    }
  };

  // Download PDF rekap lauk pauk
  const handleDownloadLaukPaukPDF = () => {
    const doc = new jsPDF("l", "mm", "a4"); // landscape, mm, A4

    // Logo kiri atas
    try {
      doc.addImage(logoBase64, "PNG", 10, 10, 25, 25);
    } catch {
      // logo gagal dimuat, lanjutkan tanpa logo
    }

    // Judul dan alamat
    doc.setFontSize(16);
    doc.text("UNIVERSITAS ISLAM SULTAN AGUNG SEMARANG", 148, 20, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(
      "Jl.Raya Kaligawe Km.4 Semarang 50112; PO Box 1054/SM Indonesia",
      148,
      28,
      { align: "center" }
    );
    doc.text("Telp (024) 6583584 Fax. (024) 6582455", 148, 34, {
      align: "center",
    });
    doc.text(
      "Email : informasi@unissula.ac.id Homepage : http://unissula.ac.id",
      148,
      40,
      { align: "center" }
    );

    // Garis bawah
    doc.setLineWidth(0.5);
    doc.line(10, 44, 287, 44);

    // Tabel
    autoTable(doc, {
      startY: 50,
      head: [
        [
          "No",
          "NIK",
          "Nama Pegawai",
          "Unit Kerja",
          "Hari Efektif",
          "Hadir",
          "Izin",
          "Sakit",
          "Cuti",
          "Tidak Masuk",
          "Dinas",
          "Terlambat",
          "Pulang Awal",
          "Jam Datang Kosong",
          "Jam Pulang Kosong",
          "Lembur",
          "Libur",
          "Nominal Lauk Pauk",
        ],
      ],
      body: rekapLaukPauk.map((row) => [
        row.no,
        row.nik,
        row.nama_pegawai,
        row.unit_kerja,
        row.hari_efektif,
        row.jumlah_hadir,
        row.jumlah_izin,
        row.jumlah_sakit,
        row.jumlah_cuti,
        row.jumlah_tidak_masuk,
        row.jumlah_dinas,
        row.jumlah_terlambat,
        row.jumlah_pulang_awal,
        row.jumlah_jam_datang_kosong,
        row.jumlah_jam_pulang_kosong,
        row.lembur,
        row.jumlah_libur,
        (row.nominal_lauk_pauk || 0).toLocaleString("id-ID"),
      ]),
      headStyles: {
        fillColor: [22, 160, 133],
        halign: "center",
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: { fontSize: 7 },
      styles: { cellPadding: 1, font: "helvetica" },
      margin: { left: 10, right: 10 },
      tableWidth: "auto",
    });

    doc.save(
      `rekap-lauk-pauk-${
        bulanOptions.find((b) => b.value === bulan)?.label
      }-${tahunLaukPauk}.pdf`
    );
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-green-200 bg-primary p-2 opacity-80">
          assessment
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Rekap Presensi Bulanan
          </div>
          <div className="text-gray-600 text-base font-medium">
            Pantau history & rekap presensi per unit
          </div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        <div className="border border-gray-300 bg-white p-4">
          <div className="flex gap-2 mb-6">
            <button
              className={`px-6 py-3 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "history"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("history")}
            >
              <span className="material-icons text-base">history</span>
              History Presensi
            </button>
            <button
              className={`px-6 py-3 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "rekap"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("rekap")}
            >
              <span className="material-icons text-base">people</span>
              Rekap Presensi Pegawai
            </button>
            <button
              className={`px-6 py-3 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "laukPauk"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("laukPauk")}
            >
              <span className="material-icons text-base">restaurant</span>
              Rekap Lauk Pauk
            </button>
          </div>
          {tab === "history" &&
            (loading ? (
              <div className="text-center py-12 text-emerald-600 font-bold flex items-center justify-center gap-2">
                <span className="material-icons animate-spin">refresh</span>
                Memuat data history presensi...
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span className="material-icons">description</span>
                    <span className="font-semibold">
                      Total Data: {data.length} records
                    </span>
                  </div>
                  <button
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center gap-2"
                    onClick={handleDownloadHistoryPDF}
                  >
                    <span className="material-icons text-base">download</span>
                    Download PDF
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border border-gray-200 overflow-hidden shadow-sm">
                    <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                      <tr>
                        <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-12 text-base">
                          <span className="material-icons text-base">
                            format_list_numbered
                          </span>
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-32 text-base">
                          No KTP
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-56 text-base">
                          Nama
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-32 text-base">
                          Status
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                          Waktu
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                          Keterangan
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
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100 font-semibold text-sm">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                              {row.no_ktp}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-sm">
                              {row.nama}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-sm">
                              {row.status}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                              {new Date(row.waktu).toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                              {row.keterangan || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center text-gray-400 py-8"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <span className="material-icons text-4xl text-gray-300">
                                inbox
                              </span>
                              <span className="font-semibold">
                                Tidak ada data ditemukan
                              </span>
                              <span className="text-sm">
                                Data history presensi kosong
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ))}
          {tab === "rekap" && (
            <>
              <div className="flex items-end justify-between gap-4 mb-6">
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
                      className="p-2 w-full rounded border border-gray-200 outline-none text-sm"
                      value={searchValue}
                      onChange={handleSearch}
                    />
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
                  <table className="min-w-full text-xs border border-gray-200 overflow-hidden shadow-sm">
                    <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                      <tr>
                        <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-12 text-base">
                          <span className="material-icons text-base">
                            format_list_numbered
                          </span>
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-32 text-base">
                          NIK
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-56 text-base">
                          Nama
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                          Unit Detail
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                          Shift
                        </th>
                        <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                          <div className="flex flex-col leading-tight">
                            <span>REKAP BULANAN</span>
                            <span className="text-xs font-normal text-gray-400 normal-case">
                              Presensi Bulanan Pegawai
                            </span>
                          </div>
                        </th>
                        <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                          <div className="flex flex-col leading-tight">
                            <span>PRESENSI</span>
                            <span className="text-xs font-normal text-gray-400 normal-case">
                              History Presensi Pegawai
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
                            className={
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100 font-semibold text-sm">
                              {idx +
                                1 +
                                (pegawaiPagination.current_page - 1) * 20}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                              {row.no_ktp}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-sm">
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
                            <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-700 text-sm">
                              {row?.unit_detail_name || "-"}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-700 text-sm">
                              {row?.shift_name || "-"}
                            </td>
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100">
                              <button
                                className="p-2 hover:bg-emerald-100 transition"
                                title="Lihat Detail Rekap Bulanan"
                                onClick={() =>
                                  navigate(
                                    `/presensi/rekap-bulanan-pegawai/${row.id}?tahun=${tahun}`
                                  )
                                }
                              >
                                <span className="material-icons text-emerald-600">
                                  visibility
                                </span>
                              </button>
                            </td>
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100">
                              <button
                                className="p-2 hover:bg-blue-100 transition"
                                title="Lihat Rekap Presensi"
                                onClick={() =>
                                  navigate(
                                    `/presensi/detail-history-presensi/${row.id}`
                                  )
                                }
                              >
                                <span className="material-icons text-blue-600">
                                  history
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center text-gray-400 py-8"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <span className="material-icons text-4xl text-gray-300">
                                people_outline
                              </span>
                              <span className="font-semibold">
                                Tidak ada data pegawai
                              </span>
                              <span className="text-sm">
                                Data pegawai kosong
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {pegawaiPagination && pegawaiPagination.last_page > 1 && (
                    <div className="flex flex-wrap gap-1 justify-center mt-6">
                      {renderPaginationButtons()}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          {tab === "laukPauk" && (
            <div className="space-y-6">
              {/* Setting Lauk Pauk Section */}
              <div className="border border-gray-300 bg-white p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-emerald-600 text-2xl">
                      settings
                    </span>
                    <h2 className="text-xl font-bold text-emerald-700">
                      Setting Lauk Pauk
                    </h2>
                  </div>
                  <button
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center gap-2"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ nominal: "" });
                      setShowForm(true);
                    }}
                  >
                    <span className="material-icons text-base">add</span>
                    Tambah Lauk Pauk
                  </button>
                </div>

                {laukPaukLoading ? (
                  <div className="text-center py-8 text-emerald-600 font-bold flex items-center justify-center gap-2">
                    <span className="material-icons animate-spin">refresh</span>
                    Memuat data lauk pauk...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-gray-200 overflow-hidden shadow-sm">
                      <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                        <tr>
                          <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-12 text-base">
                            <span className="material-icons text-base">
                              format_list_numbered
                            </span>
                          </th>
                          <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-32 text-base">
                            Nominal
                          </th>
                          <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-16 text-base">
                            <span className="material-icons text-base">
                              build
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {laukPaukData ? (
                          <tr className="transition hover:bg-emerald-50 bg-white">
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100 font-semibold text-sm">
                              1
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                              <span className="font-bold text-green-600">
                                Rp{" "}
                                {laukPaukData.nominal?.toLocaleString("id-ID")}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100">
                              <div className="flex justify-center gap-1">
                                <button
                                  className="p-2 hover:bg-emerald-100 transition"
                                  title="Edit Lauk Pauk"
                                  onClick={() =>
                                    handleEditLaukPauk(laukPaukData)
                                  }
                                >
                                  <span className="material-icons text-emerald-600">
                                    edit
                                  </span>
                                </button>
                                <button
                                  className="p-2 hover:bg-red-100 transition"
                                  title="Hapus Lauk Pauk"
                                  onClick={() =>
                                    handleDeleteLaukPauk(laukPaukData.id)
                                  }
                                >
                                  <span className="material-icons text-red-600">
                                    delete
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                              className="text-center text-gray-400 py-8"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <span className="material-icons text-4xl text-gray-300">
                                  attach_money
                                </span>
                                <span className="font-semibold">
                                  Tidak ada data lauk pauk
                                </span>
                                <span className="text-sm">
                                  Belum ada setting nominal lauk pauk
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {showForm && (
                  <div className="mt-6 p-6 bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-icons text-emerald-600">
                        edit
                      </span>
                      <h3 className="text-lg font-bold text-emerald-700">
                        {editingId ? "Edit Lauk Pauk" : "Tambah Lauk Pauk"}
                      </h3>
                    </div>
                    <form onSubmit={handleLaukPaukSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="nominal"
                          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        >
                          <span className="material-icons text-base">
                            attach_money
                          </span>
                          Nominal (Rp)
                        </label>
                        <input
                          type="number"
                          id="nominal"
                          className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          value={formData.nominal}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nominal: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-300 text-gray-800 font-bold text-sm hover:bg-gray-400 transition flex items-center gap-2"
                          onClick={() => setShowForm(false)}
                        >
                          <span className="material-icons text-base">
                            close
                          </span>
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center gap-2"
                        >
                          <span className="material-icons text-base">save</span>
                          Simpan
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Rekap Lauk Pauk Section */}
              <div className="border border-gray-300 bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-icons text-emerald-600 text-2xl">
                    assessment
                  </span>
                  <h2 className="text-xl font-bold text-emerald-700">
                    Generate Rekap Lauk Pauk
                  </h2>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="material-icons text-base">
                        calendar_month
                      </span>
                      Bulan
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={bulan}
                      onChange={(e) => setBulan(Number(e.target.value))}
                    >
                      {bulanOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="material-icons text-base">event</span>
                      Tahun
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={tahunLaukPauk}
                      onChange={(e) => setTahunLaukPauk(Number(e.target.value))}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center gap-2"
                      onClick={fetchRekapLaukPauk}
                      disabled={loadingLaukPauk}
                    >
                      {loadingLaukPauk ? (
                        <>
                          <span className="material-icons animate-spin">
                            refresh
                          </span>
                          Loading...
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-base">
                            play_arrow
                          </span>
                          Generate Data
                        </>
                      )}
                    </button>
                    {rekapLaukPauk.length > 0 && (
                      <button
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition flex items-center gap-2"
                        onClick={handleDownloadLaukPaukPDF}
                      >
                        <span className="material-icons text-base">
                          download
                        </span>
                        Download PDF
                      </button>
                    )}
                  </div>
                </div>

                {rekapLaukPauk.length > 0 && (
                  <div className="overflow-x-auto">
                    <div className="flex items-center gap-2 mb-4 text-emerald-700">
                      <span className="material-icons">table_chart</span>
                      <span className="font-semibold">
                        Total Data: {rekapLaukPauk.length} records
                      </span>
                    </div>
                    <table className="min-w-full text-sm border border-gray-200">
                      <thead className="bg-emerald-50 border-b border-emerald-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-emerald-800">
                            No
                          </th>
                          <th className="px-4 py-3 text-left font-bold text-emerald-800">
                            NIK
                          </th>
                          <th className="px-4 py-3 text-left font-bold text-emerald-800">
                            Nama Pegawai
                          </th>
                          <th className="px-4 py-3 text-left font-bold text-emerald-800">
                            Unit Kerja
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Hari Efektif
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Hadir
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Izin
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Sakit
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Cuti
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Tidak Masuk
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Dinas
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Terlambat
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Pulang Awal
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Jam Datang Kosong
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Jam Pulang Kosong
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Lembur
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Libur
                          </th>
                          <th className="px-4 py-3 text-center font-bold text-emerald-800">
                            Nominal Lauk Pauk
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {rekapLaukPauk.map((row, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-900">
                              {row.no}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {row.nik}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {row.nama_pegawai}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {row.unit_kerja}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {row.hari_efektif}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800">
                                {row.jumlah_hadir}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-sky-100 text-sky-800">
                                {row.jumlah_izin}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-red-100 text-red-800">
                                {row.jumlah_sakit}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">
                                {row.jumlah_cuti}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800">
                                {row.jumlah_tidak_masuk}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800">
                                {row.jumlah_dinas}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800">
                                {row.jumlah_terlambat}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-pink-100 text-pink-800">
                                {row.jumlah_pulang_awal}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800">
                                {row.jumlah_jam_datang_kosong}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-teal-100 text-teal-800">
                                {row.jumlah_jam_pulang_kosong}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800">
                                {row.lembur}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-lime-100 text-lime-800">
                                {row.jumlah_libur}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-green-600">
                              Rp{" "}
                              {(row.nominal_lauk_pauk || 0).toLocaleString(
                                "id-ID"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
