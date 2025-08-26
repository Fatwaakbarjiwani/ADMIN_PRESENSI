import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchLembur,
  fetchPresensiHistoryByUnit,
} from "../../redux/actions/presensiAction";
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
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";

// Logo ybwsa base64 PNG (dummy, ganti dengan logo asli jika ada)
const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC..."; // Potong, ganti dengan base64 logo asli jika ada

export default function RekapPresensiBulanan() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.presensi.data);
  const loading = useSelector((state) => state.presensi.loading);
  const { lemburData } = useSelector((state) => state.presensi);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const pegawai = useSelector((state) => state.pegawai.data);
  const pegawaiLoading = useSelector((state) => state.pegawai.loading);
  const pegawaiPagination = useSelector((state) => state.pegawai.pagination);
  const isSuperAdmin = user?.role === "super_admin";
  const units = useSelector((state) => state.unitDetail.units);
  const token = useSelector((state) => state.auth.token);
  const today = new Date();
  const defaultFrom = today.toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [tab, setTab] = useState(() => {
    // Load tab dari localStorage saat komponen mount
    const savedTab = localStorage.getItem("rekapPresensiTab");
    return savedTab || "history";
  });
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);
  const [filterUnit, setFilterUnit] = useState("");

  // State untuk rekap lauk pauk
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahunLaukPauk, setTahunLaukPauk] = useState(new Date().getFullYear());
  const [rekapLaukPauk, setRekapLaukPauk] = useState([]);
  const [loadingLaukPauk, setLoadingLaukPauk] = useState(false);
  // lembur
  const [loadingLembur, setLoadingLembur] = useState(false);
  // State untuk setting lauk pauk
  const laukPaukData = useSelector((state) => state.laukPauk.data);
  const laukPaukLoading = useSelector((state) => state.laukPauk.loading);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nominal: "",
    pot_izin_pribadi: "",
    pot_tanpa_izin: "",
    pot_sakit: "",
    pot_pulang_awal_beralasan: "",
    pot_pulang_awal_tanpa_beralasan: "",
    pot_terlambat_0806_0900: "",
    pot_terlambat_0901_1000: "",
    pot_terlambat_setelah_1000: "",
  });
  const [searchValue, setSearchValue] = useState("");

  // Effect untuk menyimpan tab ke localStorage saat berubah
  useEffect(() => {
    localStorage.setItem("rekapPresensiTab", tab);
  }, [tab]);

  // Effect untuk load data berdasarkan tab yang aktif
  useEffect(() => {
    if (user !== null && tab === "history") {
      dispatch(fetchPresensiHistoryByUnit(fromDate));
    }
  }, [dispatch, user, tab, fromDate]);

  useEffect(() => {
    if (token && tab === "rekap") {
      dispatch(
        fetchPegawai(
          user?.role === "super_admin",
          token,
          currentPage,
          searchValue
        )
      );
    }
  }, [token, user, currentPage, searchValue, tab]);

  useEffect(() => {
    if (token && tab === "laukPauk") {
      // dispatch(fetchLaukPauk(filterUnit, isSuperAdmin, user?.unit_id));
      dispatch(fetchLaukPauk(filterUnit, isSuperAdmin));
      dispatch(fetchAllUnit());
    }
  }, [token, tab, dispatch, filterUnit, isSuperAdmin]);

  useEffect(() => {
    if (token && tab === "lembur") {
      dispatch(fetchLembur(bulan, tahun, filterUnit, isSuperAdmin));
      dispatch(fetchAllUnit());
    }
  }, [token, tab, dispatch, bulan, tahun, filterUnit, isSuperAdmin]);

  // Fungsi untuk handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
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

  // fetch Lembur
  const fetchLaporanLembur = async (bulan, tahun) => {
    setLoadingLembur(true);
    dispatch(fetchLembur(bulan, tahun, filterUnit, isSuperAdmin)).finally(() =>
      setLoadingLembur(false)
    );
  };

  // Fungsi untuk handle form lauk pauk
  const handleLaukPaukSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      nominal: parseInt(formData.nominal),
      pot_izin_pribadi: parseInt(formData.pot_izin_pribadi),
      pot_tanpa_izin: parseInt(formData.pot_tanpa_izin),
      pot_sakit: parseInt(formData.pot_sakit),
      pot_pulang_awal_beralasan: parseInt(formData.pot_pulang_awal_beralasan),
      pot_pulang_awal_tanpa_beralasan: parseInt(
        formData.pot_pulang_awal_tanpa_beralasan
      ),
      pot_terlambat_0806_0900: parseInt(formData.pot_terlambat_0806_0900),
      pot_terlambat_0901_1000: parseInt(formData.pot_terlambat_0901_1000),
      pot_terlambat_setelah_1000: parseInt(formData.pot_terlambat_setelah_1000),
    };

    if (editingId) {
      dispatch(updateLaukPauk(editingId, submitData));
    } else {
      dispatch(createLaukPauk(submitData));
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({
      nominal: "",
      pot_izin_pribadi: "",
      pot_tanpa_izin: "",
      pot_sakit: "",
      pot_pulang_awal_beralasan: "",
      pot_pulang_awal_tanpa_beralasan: "",
      pot_terlambat_0806_0900: "",
      pot_terlambat_0901_1000: "",
      pot_terlambat_setelah_1000: "",
    });
  };

  const handleEditLaukPauk = (data) => {
    setEditingId(data.id);
    setFormData({
      nominal: data.nominal?.toString() || "",
      pot_izin_pribadi: data.pot_izin_pribadi?.toString() || "",
      pot_tanpa_izin: data.pot_tanpa_izin?.toString() || "",
      pot_sakit: data.pot_sakit?.toString() || "",
      pot_pulang_awal_beralasan:
        data.pot_pulang_awal_beralasan?.toString() || "",
      pot_pulang_awal_tanpa_beralasan:
        data.pot_pulang_awal_tanpa_beralasan?.toString() || "",
      pot_terlambat_0806_0900: data.pot_terlambat_0806_0900?.toString() || "",
      pot_terlambat_0901_1000: data.pot_terlambat_0901_1000?.toString() || "",
      pot_terlambat_setelah_1000:
        data.pot_terlambat_setelah_1000?.toString() || "",
    });
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
    doc.text("YAYASAN BADAN WAKAF SULTAN AGUNG", 148, 20, {
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
      "Email : informasi@ybwsa.ac.id Homepage : http://ybwsa.ac.id",
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
          "No KTP",
          "Nama",
          "Status Masuk",
          "Status Pulang",
          "Status Presensi",
          "Waktu Masuk",
          "Waktu Pulang",
          "Keterangan Masuk",
          "Keterangan Pulang",
        ],
      ],
      body: data.map((row, idx) => [
        idx + 1,
        row.no_ktp,
        row.nama,
        row.status_masuk,
        row.status_pulang,
        row.status_presensi,
        row.waktu_masuk
          ? new Date(row.waktu_masuk).toLocaleString("id-ID")
          : "-",
        row.waktu_pulang
          ? new Date(row.waktu_pulang).toLocaleString("id-ID")
          : "-",
        row.keterangan_masuk || "-",
        row.keterangan_pulang || "-",
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
    doc.save("history-presensi-ybwsa.pdf");
  };
  const handleDownloadPDFLembur = () => {
    if (!lemburData || lemburData.length === 0) return;

    const doc = new jsPDF("l", "mm", "a4"); // landscape A4

    // Logo (opsional)
    try {
      doc.addImage(logoBase64, "PNG", 10, 10, 25, 25);
    } catch {
      // kalau logo gagal dimuat, lanjutkan
    }

    // Header
    doc.setFontSize(16);
    doc.text("YAYASAN BADAN WAKAF SULTAN AGUNG", 148, 20, {
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
      "Email : informasi@ybwsa.ac.id Homepage : http://ybwsa.ac.id",
      148,
      40,
      { align: "center" }
    );

    // Garis bawah
    doc.setLineWidth(0.5);
    doc.line(10, 44, 287, 44);

    // Judul laporan
    doc.setFontSize(12);
    doc.text("LAPORAN REKAP LEMBUR PEGAWAI", 148, 55, { align: "center" });
    doc.setFontSize(10);
    doc.text(
      `Periode: ${bulanOptions.find((b) => b.value === bulan)?.label} ${tahun}`,
      20,
      65
    );

    // Tabel lembur -> style samakan dengan history
    autoTable(doc, {
      startY: 75,
      head: [
        [
          "NO",
          "NIK",
          "Nama",
          "Unit",
          "Tanggal",
          "Waktu Masuk",
          "Waktu Pulang",
          "Lembur",
        ],
      ],
      body: lemburData.map((row, idx) => [
        idx + 1,
        row.no_ktp,
        [row.gelar_depan, row.nama, row.gelar_belakang]
          .filter(Boolean)
          .join(" "),
        row?.nama_unit || "-",
        formatTanggal(row?.tanggal),
        row?.waktu_masuk || "-",
        row?.waktu_pulang || "-",
        formatOvertime(row?.menit_overtime),
      ]),
      theme: "grid", // samakan seperti history
      headStyles: {
        fillColor: [22, 160, 133], // hijau emerald (history)
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
      `laporan-lembur-${
        bulanOptions.find((b) => b.value === bulan)?.label
      }-${tahun}.pdf`
    );
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
        }/api/presensi/rekap-bulanan-semua-pegawai?${
          isSuperAdmin ? `unit_id=${filterUnit}&` : ""
        }bulan=${bulan}&tahun=${tahunLaukPauk}`,
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
    doc.text("YAYASAN BADAN WAKAF SULTAN AGUNG", 148, 20, {
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
      "Email : informasi@nama.ac.id Homepage : http://ybwsa.ac.id",
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

  // konversi menit
  const formatOvertime = (minutes) => {
    if (!minutes) return "-";
    const jam = Math.floor(minutes / 60);
    const menit = minutes % 60;
    return `${jam} jam ${menit} menit`;
  };
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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
            {!isSuperAdmin ? (
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
            ) : null}
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
            {!isSuperAdmin && (
              <button
                className={`px-6 py-3 font-bold text-sm transition border-2 flex items-center gap-2 ${
                  tab === "lembur"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setTab("lembur")}
              >
                <span className="material-icons text-base">watch</span>
                Rekap Lembur Pegawai
              </button>
            )}
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
                  <div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <span className="material-icons">description</span>
                      <span className="font-semibold">
                        Total Data: {data.length} records
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <label className="font-semibold">Dari:</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border px-2 py-1 rounded"
                      />
                    </div>
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
                  <table className="min-w-[200%] text-xs border border-gray-200 overflow-hidden shadow-sm">
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
                          Status Masuk
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-32 text-base">
                          Status Pulang
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-32 text-base">
                          Status Presensi
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                          Waktu Masuk
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                          Waktu Pulang
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                          Keterangan Masuk
                        </th>
                        <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                          Keterangan Pulang
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
                              {row.status_masuk}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-sm">
                              {row.status_pulang}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-sm">
                              {row.status_presensi}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                              {row.waktu_masuk
                                ? new Date(row.waktu_masuk).toLocaleString(
                                    "id-ID"
                                  )
                                : "-"}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                              {row.waktu_pulang
                                ? new Date(row.waktu_pulang).toLocaleString(
                                    "id-ID"
                                  )
                                : "-"}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                              {row.keterangan_masuk || "-"}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                              {row.keterangan_pulang || "-"}
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
                  <table className="min-w-[120%] text-xs border border-gray-200 overflow-hidden shadow-sm">
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
                          Unit
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
                        <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                          <div className="flex flex-col leading-tight">
                            <span>KEHADIRAN</span>
                            <span className="text-xs font-normal text-gray-400 normal-case">
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
                              {row.nama}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-700 text-sm">
                              {row?.nama_unit || "-"}
                            </td>
                            <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-700 text-sm">
                              {row?.nama_shift || "-"}
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
                                    `/presensi/detail-history-presensi/${row.id}/${row.unit_id_presensi}`
                                  )
                                }
                              >
                                <span className="material-icons text-blue-600">
                                  history
                                </span>
                              </button>
                            </td>
                            <td className="px-4 py-4 text-center align-middle border-b border-gray-100">
                              <button
                                className="p-2 hover:bg-orange-100 transition"
                                title="Lihat Laporan Kehadiran"
                                onClick={() =>
                                  navigate(
                                    `/presensi/laporan-kehadiran/${row.id}`
                                  )
                                }
                              >
                                <span className="material-icons text-orange-600">
                                  assessment
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
          {tab === "lembur" && (
            <div className="space-y-6">
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
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center gap-2"
                    onClick={() => fetchLaporanLembur(bulan, tahun)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="material-icons animate-spin">
                          refresh
                        </span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-base">search</span>
                        Cari Data
                      </>
                    )}
                  </button>
                  {lemburData.length > 0 && (
                    <button
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center gap-2"
                      onClick={handleDownloadPDFLembur}
                    >
                      <span className="material-icons text-base">download</span>
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
              {loadingLembur ? (
                <div className="text-center py-12 text-emerald-600 font-bold flex items-center justify-center gap-2">
                  <span className="material-icons animate-spin">refresh</span>
                  Memuat data rekap lembur...
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[130%] text-xs border border-gray-200 overflow-hidden shadow-sm">
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
                            Unit
                          </th>
                          <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide uppercase w-40 text-base">
                            Tanggal
                          </th>
                          <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                            Waktu Masuk
                          </th>
                          <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                            Waktu Pulang
                          </th>
                          <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                            Lembur
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {lemburData?.length > 0 ? (
                          lemburData?.map((row, idx) => (
                            <tr
                              key={row.id}
                              className={
                                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-4 py-4 text-center align-middle border-b border-gray-100 font-semibold text-sm">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-4 align-middle border-b border-gray-100 text-sm">
                                {row.no_ktp}
                              </td>
                              <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-sm">
                                {[row.gelar_depan, row.nama, row.gelar_belakang]
                                  .filter(Boolean)
                                  .join(" ")}
                              </td>
                              <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-700 text-sm">
                                {row?.nama_unit || "-"}
                              </td>
                              <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-700 text-sm">
                                {formatTanggal(row?.tanggal)}
                              </td>
                              <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-700 text-sm">
                                {row?.waktu_masuk || "-"}
                              </td>
                              <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-700 text-sm">
                                {row?.waktu_pulang || "-"}
                              </td>
                              <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-700 text-sm">
                                {formatOvertime(row?.menit_overtime)}
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
                                  watch
                                </span>
                                <span className="font-semibold">
                                  Tidak ada data lembur pegawai
                                </span>
                                <span className="text-sm">
                                  Data lembur pegawai kosong
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Pagination
                    {pegawaiPagination && pegawaiPagination.last_page > 1 && (
                      <div className="flex flex-wrap gap-1 justify-center mt-6">
                        {renderPaginationButtons()}
                      </div>
                    )} */}
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === "laukPauk" && (
            <div className="space-y-6">
              {isSuperAdmin && (
                <select
                  className="border border-gray-300 px-3 py-2 text-sm min-w-[160px] rounded"
                  value={filterUnit}
                  onChange={(e) => setFilterUnit(e.target.value)}
                >
                  <option value="">Semua Unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              )}
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
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center gap-2 "
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        nominal: "",
                        pot_izin_pribadi: "",
                        pot_tanpa_izin: "",
                        pot_sakit: "",
                        pot_pulang_awal_beralasan: "",
                        pot_pulang_awal_tanpa_beralasan: "",
                        pot_terlambat_0806_0900: "",
                        pot_terlambat_0901_1000: "",
                        pot_terlambat_setelah_1000: "",
                      });
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
                    {/* Data Lauk Pauk Card Grid Layout */}
                    <div className="mb-6">
                      {laukPaukData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-white border border-gray-200 p-4">
                            <div className="text-sm text-gray-500 mb-1">
                              Nominal
                            </div>
                            <div className="text-xl font-bold text-emerald-700">
                              Rp {laukPaukData.nominal?.toLocaleString("id-ID")}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 p-4">
                            <div className="text-sm text-gray-500 mb-1">
                              Potongan Izin Pribadi
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                              Rp{" "}
                              {laukPaukData.pot_izin_pribadi?.toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 p-4">
                            <div className="text-sm text-gray-500 mb-1">
                              Potongan Tanpa Izin
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                              Rp{" "}
                              {laukPaukData.pot_tanpa_izin?.toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 p-4">
                            <div className="text-sm text-gray-500 mb-1">
                              Potongan Sakit
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                              Rp{" "}
                              {laukPaukData.pot_sakit?.toLocaleString("id-ID")}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 p-4">
                            <div className="text-sm text-gray-500 mb-1">
                              Potongan Pulang Awal Beralasan
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                              Rp{" "}
                              {laukPaukData.pot_pulang_awal_beralasan?.toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 p-4">
                            <div className="text-sm text-gray-500 mb-1">
                              Potongan Pulang Awal Tanpa Beralasan
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                              Rp{" "}
                              {laukPaukData.pot_pulang_awal_tanpa_beralasan?.toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 p-4">
                            <div className="text-sm text-gray-500 mb-1">
                              Potongan Terlambat 08:06-09:00
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                              Rp{" "}
                              {laukPaukData.pot_terlambat_0806_0900?.toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 p-4">
                            <div className="text-sm text-gray-500 mb-1">
                              Potongan Terlambat 09:01-10:00
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                              Rp{" "}
                              {laukPaukData.pot_terlambat_0901_1000?.toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 p-4">
                            <div className="text-sm text-gray-500 mb-1">
                              Potongan Terlambat Setelah 10:00
                            </div>
                            <div className="text-lg font-semibold text-gray-800">
                              Rp{" "}
                              {laukPaukData.pot_terlambat_setelah_1000?.toLocaleString(
                                "id-ID"
                              )}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 p-4 flex items-center justify-center">
                            <div className="flex gap-2">
                              <button
                                className="px-4 py-2 border border-emerald-600 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                                title="Edit Lauk Pauk"
                                onClick={() => handleEditLaukPauk(laukPaukData)}
                              >
                                Edit
                              </button>
                              <button
                                className="px-4 py-2 border border-red-600 text-red-700 font-semibold hover:bg-red-50 transition"
                                title="Hapus Lauk Pauk"
                                onClick={() =>
                                  handleDeleteLaukPauk(laukPaukData.id)
                                }
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-12">
                          <div className="text-lg font-semibold mb-2">
                            Tidak ada data
                          </div>
                          <div className="text-sm">
                            Belum ada setting nominal lauk pauk
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showForm && (
                  <div className="mt-6 p-6 bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-icons text-emerald-600">
                        {editingId ? "edit" : "add"}
                      </span>
                      <h3 className="text-lg font-bold text-emerald-700">
                        {editingId ? "Edit Lauk Pauk" : "Tambah Lauk Pauk"}
                      </h3>
                    </div>
                    <form onSubmit={handleLaukPaukSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-0 border-b border-gray-200">
                          <label
                            htmlFor="nominal"
                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                          >
                            <span className="material-icons text-base text-emerald-600">
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
                            placeholder="500000"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Nominal Lauk Pauk
                          </p>
                        </div>
                        <div className="p-0 border-b border-gray-200">
                          <label
                            htmlFor="pot_izin_pribadi"
                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                          >
                            <span className="material-icons text-base text-red-600">
                              money_off
                            </span>
                            Potongan Izin Pribadi (Rp)
                          </label>
                          <input
                            type="number"
                            id="pot_izin_pribadi"
                            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={formData.pot_izin_pribadi}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pot_izin_pribadi: e.target.value,
                              })
                            }
                            required
                            placeholder="20000"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Potongan izin pribadi
                          </p>
                        </div>
                        <div className="p-0 border-b border-gray-200">
                          <label
                            htmlFor="pot_tanpa_izin"
                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                          >
                            <span className="material-icons text-base text-red-600">
                              money_off
                            </span>
                            Potongan Tanpa Izin (Rp)
                          </label>
                          <input
                            type="number"
                            id="pot_tanpa_izin"
                            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={formData.pot_tanpa_izin}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pot_tanpa_izin: e.target.value,
                              })
                            }
                            required
                            placeholder="25000"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Potongan tanpa izin
                          </p>
                        </div>
                        <div className="p-0 border-b border-gray-200">
                          <label
                            htmlFor="pot_sakit"
                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                          >
                            <span className="material-icons text-base text-red-600">
                              money_off
                            </span>
                            Potongan Sakit (Rp)
                          </label>
                          <input
                            type="number"
                            id="pot_sakit"
                            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={formData.pot_sakit}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pot_sakit: e.target.value,
                              })
                            }
                            required
                            placeholder="15000"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Potongan sakit
                          </p>
                        </div>
                        <div className="p-0 border-b border-gray-200">
                          <label
                            htmlFor="pot_pulang_awal_beralasan"
                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                          >
                            <span className="material-icons text-base text-red-600">
                              money_off
                            </span>
                            Potongan Pulang Awal Beralasan (Rp)
                          </label>
                          <input
                            type="number"
                            id="pot_pulang_awal_beralasan"
                            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={formData.pot_pulang_awal_beralasan}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pot_pulang_awal_beralasan: e.target.value,
                              })
                            }
                            required
                            placeholder="10000"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Potongan pulang awal dengan alasan
                          </p>
                        </div>
                        <div className="p-0 border-b border-gray-200">
                          <label
                            htmlFor="pot_pulang_awal_tanpa_beralasan"
                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                          >
                            <span className="material-icons text-base text-red-600">
                              money_off
                            </span>
                            Potongan Pulang Awal Tanpa Beralasan (Rp)
                          </label>
                          <input
                            type="number"
                            id="pot_pulang_awal_tanpa_beralasan"
                            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={formData.pot_pulang_awal_tanpa_beralasan}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pot_pulang_awal_tanpa_beralasan: e.target.value,
                              })
                            }
                            required
                            placeholder="15000"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Potongan pulang awal tanpa alasan
                          </p>
                        </div>
                        <div className="p-0 border-b border-gray-200">
                          <label
                            htmlFor="pot_terlambat_0806_0900"
                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                          >
                            <span className="material-icons text-base text-red-600">
                              money_off
                            </span>
                            Potongan Terlambat 08:06-09:00 (Rp)
                          </label>
                          <input
                            type="number"
                            id="pot_terlambat_0806_0900"
                            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={formData.pot_terlambat_0806_0900}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pot_terlambat_0806_0900: e.target.value,
                              })
                            }
                            required
                            placeholder="3000"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Potongan terlambat pukul 08.06 - 09.00
                          </p>
                        </div>
                        <div className="p-0 border-b border-gray-200">
                          <label
                            htmlFor="pot_terlambat_0901_1000"
                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                          >
                            <span className="material-icons text-base text-red-600">
                              money_off
                            </span>
                            Potongan Terlambat 09:01-10:00 (Rp)
                          </label>
                          <input
                            type="number"
                            id="pot_terlambat_0901_1000"
                            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={formData.pot_terlambat_0901_1000}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pot_terlambat_0901_1000: e.target.value,
                              })
                            }
                            required
                            placeholder="2000"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Potongan terlambat 09.01 - 10.00
                          </p>
                        </div>
                        <div className="p-0 border-b border-gray-200">
                          <label
                            htmlFor="pot_terlambat_setelah_1000"
                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                          >
                            <span className="material-icons text-base text-red-600">
                              money_off
                            </span>
                            Potongan Terlambat Setelah 10:00 (Rp)
                          </label>
                          <input
                            type="number"
                            id="pot_terlambat_setelah_1000"
                            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={formData.pot_terlambat_setelah_1000}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pot_terlambat_setelah_1000: e.target.value,
                              })
                            }
                            required
                            placeholder="1000"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Potongan terlambat setelah pukul 10.00
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition flex items-center gap-2"
                          onClick={() => setShowForm(false)}
                        >
                          <span className="material-icons text-base">
                            close
                          </span>
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
                        >
                          <span className="material-icons text-base">save</span>
                          {editingId ? "Update" : "Simpan"}
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
                  <>
                    <div className="mb-4 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <span className="material-icons">description</span>
                        <span className="font-semibold">
                          Total Data: {rekapLaukPauk.length} records
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                      <table className="min-w-full text-xs">
                        <thead className="bg-emerald-600 text-white">
                          <tr>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-16">
                              NO
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24">
                              NIK
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-40">
                              NAMA PEGAWAI
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-32">
                              UNIT KERJA
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24">
                              HARI EFEKTIF
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">
                              HADIR
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">
                              IZIN
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">
                              SAKIT
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">
                              CUTI
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-28">
                              TIDAK MASUK
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">
                              DINAS
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24">
                              TERLAMBAT
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24">
                              PULANG AWAL
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-32">
                              JAM DATANG KOSONG
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-32">
                              JAM PULANG KOSONG
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">
                              LEMBUR
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">
                              LIBUR
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm w-32">
                              NOMINAL LAUK PAUK
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rekapLaukPauk.map((row, idx) => (
                            <tr
                              key={idx}
                              className={`transition hover:bg-emerald-50 border-b border-gray-100 ${
                                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-semibold">
                                {row.no}
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                {row.nik}
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-semibold">
                                {row.nama_pegawai}
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                {row.unit_kerja}
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-semibold">
                                {row.hari_efektif}
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded">
                                  {row.jumlah_hadir}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-sky-100 text-sky-800 rounded">
                                  {row.jumlah_izin}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                                  {row.jumlah_sakit}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                                  {row.jumlah_cuti}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                                  {row.jumlah_tidak_masuk}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                                  {row.jumlah_dinas}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded">
                                  {row.jumlah_terlambat}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-pink-100 text-pink-800 rounded">
                                  {row.jumlah_pulang_awal}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded">
                                  {row.jumlah_jam_datang_kosong}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-teal-100 text-teal-800 rounded">
                                  {row.jumlah_jam_pulang_kosong}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded">
                                  {row.lembur}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-lime-100 text-lime-800 rounded">
                                  {row.jumlah_libur}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm font-bold text-green-600">
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
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
