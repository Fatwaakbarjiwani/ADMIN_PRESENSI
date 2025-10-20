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
import SettingPresensi from "./SettingPresensi";

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

  // State untuk checklist lembur - menggunakan kombinasi ID dan index
  const [selectedLembur, setSelectedLembur] = useState([]);

  // Fungsi untuk handle checklist lembur - menggunakan index sebagai identifier
  const handleLemburCheckbox = (index) => {
    console.log("=== DEBUG CHECKBOX ===");
    console.log("Clicked index:", index);
    console.log("Current selectedLembur:", selectedLembur);

    setSelectedLembur((prev) => {
      if (prev.includes(index)) {
        const newSelection = prev.filter((idx) => idx !== index);
        console.log("Removing, new selection:", newSelection);
        return newSelection;
      } else {
        const newSelection = [...prev, index];
        console.log("Adding, new selection:", newSelection);
        return newSelection;
      }
    });
  };

  // Fungsi untuk select all - menggunakan index
  const handleSelectAllLembur = () => {
    if (!lemburData || lemburData.length === 0) return;

    if (selectedLembur.length === lemburData.length) {
      setSelectedLembur([]);
    } else {
      setSelectedLembur(lemburData.map((_, index) => index));
    }
  };
  // lembur
  const [loadingLembur, setLoadingLembur] = useState(false);

  // Reset checklist ketika data lembur berubah
  useEffect(() => {
    console.log("=== LEMBUR DATA CHANGED ===");
    console.log("New lemburData:", lemburData);
    if (lemburData) {
      console.log(
        "IDs in lemburData:",
        lemburData.map((item) => item.id)
      );
      console.log("Unique IDs:", [
        ...new Set(lemburData.map((item) => item.id)),
      ]);
      console.log(
        "Has duplicates:",
        lemburData.map((item) => item.id).length !==
          [...new Set(lemburData.map((item) => item.id))].length
      );
    }
    setSelectedLembur([]);
  }, [lemburData]);
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
  }, [dispatch, token, user, currentPage, searchValue, tab]);

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
  // Fungsi untuk generate SURAT TUGAS lembur
  const handleDownloadSuratTugasLembur = () => {
    const filteredData = lemburData.filter((_, index) =>
      selectedLembur.includes(index)
    );
    if (!filteredData || filteredData.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Pilih minimal satu pegawai untuk diunduh!",
        confirmButtonColor: "#10b981",
      });
      return;
    }

    const doc = new jsPDF("p", "mm", "a4"); // portrait A4

    // Logo kiri atas
    try {
      doc.addImage(logoBase64, "PNG", 20, 20, 30, 30);
    } catch {
      // kalau logo gagal dimuat, lanjutkan
    }

    // Header YBW-SA
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text("YBW SA", 20, 25);
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text("YAYASAN BADAN WAKAF SULTAN AGUNG", 20, 30);

    // Logo kanan atas (circular)
    doc.setFontSize(8);
    doc.setFont("times", "normal");
    doc.text("BERKHIDMAT UNTUK", 150, 25, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text("1950", 150, 32, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("times", "normal");
    doc.text("KEMASLAHATAN UMAT", 150, 37, { align: "center" });

    // Judul SURAT TUGAS - ukuran dikurangi
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text("SURAT TUGAS", 105, 50, { align: "center" });

    // Teks langsung tanpa nomor surat
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text(
      "Yayasan Badan Wakaf Sultan Agung (YBW-SA) memberi tugas lembur kepada,",
      20,
      65
    );

    // Tabel penugasan - jarak dikurangi
    autoTable(doc, {
      startY: 70,
      head: [["No.", "Nama", "Jabatan", "Tugas"]],
      body: filteredData.map((row, idx) => [
        idx + 1,
        [row.gelar_depan, row.nama, row.gelar_belakang]
          .filter(Boolean)
          .join(" "),
        row?.jabatan || "Staf",
        `Lembur ${formatTanggal(row?.tanggal)}`,
      ]),
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        halign: "center",
        fontStyle: "bold",
        fontSize: 11,
      },
      bodyStyles: {
        fontSize: 10,
        halign: "left",
      },
      styles: {
        cellPadding: 3,
        font: "times",
      },
      margin: { left: 20, right: 20 },
      tableWidth: "auto",
    });

    // Keterangan waktu
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text(
      "Untuk melaksanakan tugas kerja lembur pada hari Senin tanggal 29 September 2025",
      20,
      finalY
    );
    doc.text("Demikian untuk menjadikan periksa", 20, finalY + 6);

    // Tanggal dan tempat - di tengah halaman A4
    doc.text("Semarang", 105, finalY + 20, { align: "center" });

    // Tanda tangan
    const signatureY = finalY + 35;
    doc.setFontSize(10);

    // Mengetahui - digeser ke kiri
    doc.setFont("times", "normal");
    doc.text("Mengetahui", 60, signatureY, { align: "center" });
    doc.text("Pengurus Yayasan Badan Wakaf Sultan Agung", 60, signatureY + 5, {
      align: "center",
    });
    doc.text("Sekretaris", 60, signatureY + 10, { align: "center" });
    // Nama dengan bold dan underline
    doc.setFont("times", "bold");
    doc.text(
      "Dr. Muhammad Ja'far Shodiq, SE., S.Si., M.Si., Ak. CA.",
      60,
      signatureY + 25,
      { align: "center" }
    );
    // Garis bawah untuk nama
    const name1Width = doc.getTextWidth(
      "Dr. Muhammad Ja'far Shodiq, SE., S.Si., M.Si., Ak. CA."
    );
    doc.setLineWidth(0.5);
    doc.line(
      60 - name1Width / 2,
      signatureY + 27,
      60 + name1Width / 2,
      signatureY + 27
    );

    // Kepala Sekretariat - tambah space
    doc.setFont("times", "normal");
    doc.text("Sekretariat YBW-SA", 150, signatureY, { align: "center" });
    doc.text("Kepala", 150, signatureY + 10, { align: "center" });

    // Nama dengan bold dan underline
    doc.setFont("times", "bold");
    doc.text("Ifan Rikhza Auladi, S.Pd., M.Ed", 150, signatureY + 25, {
      align: "center",
    });
    // Garis bawah untuk nama
    const name2Width = doc.getTextWidth("Ifan Rikhza Auladi, S.Pd., M.Ed");
    doc.line(
      150 - name2Width / 2,
      signatureY + 27,
      150 + name2Width / 2,
      signatureY + 27
    );

    // Tembusan - digeser ke bawah
    const tembusanY = signatureY + 50;
    doc.setFont("times", "normal");
    doc.text("Tembusan Yth.:", 20, tembusanY);
    doc.text("Kepala Bagian Keuangan dan Akuntansi YBW-SA", 20, tembusanY + 5);

    // Footer - dipindah ke paling bawah
    const footerY = tembusanY + 60;
    doc.setFontSize(8);

    // Visi - 3 baris
    doc.text("Visi", 20, footerY);
    doc.text(
      "Lembaga wakaf terkemuka yang produktif dan inovatif sebagai sarana",
      20,
      footerY + 3
    );
    doc.text(
      "syiar islam melalui pendidikan, kesehatan dan ekonomi untuk membentuk",
      20,
      footerY + 6
    );
    doc.text(
      "generasi khaira ummah serta menjawab tantangan global dalam kerangka rahmatan lil alamin",
      20,
      footerY + 9
    );

    // Alamat - 3 baris
    doc.text("Alamat", 140, footerY);
    doc.text("Jl.Raya Kaligawe Km.4 Semarang 50112", 140, footerY + 3);
    doc.text("PO Box 1054/SM Indonesia", 140, footerY + 6);
    doc.text("Telp (024) 6583584 Fax. (024) 6582455", 140, footerY + 9);

    // Simpan PDF
    doc.save(
      `surat-tugas-lembur-${
        bulanOptions.find((b) => b.value === bulan)?.label
      }-${tahun}.pdf`
    );
  };

  // Fungsi untuk generate DAFTAR LEMBUR dengan perhitungan gaji
  const handleDownloadDaftarLembur = () => {
    const filteredData = lemburData.filter((_, index) =>
      selectedLembur.includes(index)
    );
    if (!filteredData || filteredData.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Pilih minimal satu pegawai untuk diunduh!",
        confirmButtonColor: "#10b981",
      });
      return;
    }

    const doc = new jsPDF("l", "mm", "a4"); // landscape A4

    // Header - rata kiri, Times New Roman 12, sejajar dengan tabel
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text("Lampiran Surat Nomor:", 20, 20);
    doc.setFont("times", "bold");
    doc.text("DAFTAR LEMBUR", 20, 30);
    doc.text("YAYASAN BADAN WAKAF SULTAN AGUNG", 20, 35);

    // Hitung total lembur
    const totalLembur = filteredData.reduce((sum, row) => {
      const durasiJam = Math.floor((row?.menit_overtime || 0) / 60);
      const tanggal = new Date(row?.tanggal);
      const hariLibur = tanggal.getDay() === 0 || tanggal.getDay() === 6;
      const tarifPerJam = hariLibur ? 60000 : 30000;
      return sum + durasiJam * tarifPerJam;
    }, 0);

    // Tabel daftar lembur dengan footer
    autoTable(doc, {
      startY: 45,
      head: [
        [
          "No.",
          "NIK",
          "Nama",
          "Bidang/Bagian",
          "Jabatan",
          "Waktu",
          "Durasi (Jam)",
          "Lembur Dihitung",
          "Rp/jam",
          "Total",
          "TTD",
        ],
      ],
      body: filteredData.map((row, idx) => {
        const durasiJam = Math.floor((row?.menit_overtime || 0) / 60);

        // Tentukan apakah hari libur atau tidak
        const tanggal = new Date(row?.tanggal);
        const hariLibur = tanggal.getDay() === 0 || tanggal.getDay() === 6; // Minggu atau Sabtu
        const tarifPerJam = hariLibur ? 60000 : 30000; // 60k untuk libur, 30k untuk aktif
        const total = durasiJam * tarifPerJam;

        return [
          idx + 1,
          row.no_ktp,
          [row.gelar_depan, row.nama, row.gelar_belakang]
            .filter(Boolean)
            .join(" "),
          row?.nama_unit || "-",
          row?.jabatan || "Staf",
          `${row?.waktu_masuk || "17"} - ${row?.waktu_pulang || "19"}`,
          durasiJam,
          durasiJam,
          tarifPerJam.toLocaleString("id-ID"),
          total.toLocaleString("id-ID"),
          idx + 1,
        ];
      }),
      foot: [
        [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Jumlah",
          `Rp ${totalLembur.toLocaleString("id-ID")}`,
          "",
        ],
      ],
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        halign: "center",
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        halign: "center",
      },
      footStyles: {
        fontSize: 8,
        halign: "center",
        fontStyle: "bold",
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
      },
      styles: {
        cellPadding: 2,
        font: "helvetica",
      },
      margin: { left: 10, right: 10 },
      tableWidth: "auto",
    });

    // Tanggal dan tempat
    const finalY = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Semarang", 120, finalY + 10, { align: "center" });
    doc.text("Yayasan Badan Wakaf Sultan Agung", 120, finalY + 18, {
      align: "center",
    });

    // Tanda tangan - 4 kolom dengan border vertikal
    const signatureY = finalY + 30;
    const colWidth = 70;
    const startX = 10;

    // Border luar
    doc.setLineWidth(0.5);
    doc.rect(startX, signatureY, colWidth * 4, 50);

    // Garis vertikal pemisah kolom
    doc.line(startX + colWidth, signatureY, startX + colWidth, signatureY + 50);
    doc.line(
      startX + colWidth * 2,
      signatureY,
      startX + colWidth * 2,
      signatureY + 50
    );
    doc.line(
      startX + colWidth * 3,
      signatureY,
      startX + colWidth * 3,
      signatureY + 50
    );

    // Disetujui Oleh
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Disetujui Oleh", startX + colWidth / 2, signatureY + 8, {
      align: "center",
    });
    doc.text("Sekretaris YBW-SA", startX + colWidth / 2, signatureY + 22, {
      align: "center",
    });
    doc.setFont("helvetica", "bold");
    doc.text(
      "Dr. Mohammad Ja'far Shodiq, SE, S.H., M.Si., Ak., CA.",
      startX + colWidth / 2,
      signatureY + 42,
      { align: "center" }
    );

    // Diketahui Oleh
    doc.setFont("helvetica", "normal");
    doc.text(
      "Diketahui Oleh",
      startX + colWidth + colWidth / 2,
      signatureY + 8,
      { align: "center" }
    );
    doc.text(
      "Kepala Sekretariat YBW-SA",
      startX + colWidth + colWidth / 2,
      signatureY + 22,
      { align: "center" }
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      "Ifan Rikhza Auladi, S.Pd., M.Ed.",
      startX + colWidth + colWidth / 2,
      signatureY + 42,
      { align: "center" }
    );

    // Diperiksa Oleh
    doc.setFont("helvetica", "normal");
    doc.text(
      "Diperiksa Oleh",
      startX + colWidth * 2 + colWidth / 2,
      signatureY + 8,
      { align: "center" }
    );
    doc.text(
      "Kabag. SDI Sekretariat YBW-SA",
      startX + colWidth * 2 + colWidth / 2,
      signatureY + 22,
      { align: "center" }
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      "Ahmad Rudi Yulianto",
      startX + colWidth * 2 + colWidth / 2,
      signatureY + 42,
      { align: "center" }
    );

    // Dibuat Oleh
    doc.setFont("helvetica", "normal");
    doc.text(
      "Dibuat Oleh",
      startX + colWidth * 3 + colWidth / 2,
      signatureY + 8,
      { align: "center" }
    );
    doc.text(
      "Staf SDI Sekretariat YBW-SA",
      startX + colWidth * 3 + colWidth / 2,
      signatureY + 22,
      { align: "center" }
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      "Samsul Alam",
      startX + colWidth * 3 + colWidth / 2,
      signatureY + 42,
      { align: "center" }
    );

    // Garis bawah untuk nama (underline effect)
    doc.setLineWidth(0.3);
    doc.line(
      startX + 5,
      signatureY + 44,
      startX + colWidth - 5,
      signatureY + 44
    );
    doc.line(
      startX + colWidth + 5,
      signatureY + 44,
      startX + colWidth * 2 - 5,
      signatureY + 44
    );
    doc.line(
      startX + colWidth * 2 + 5,
      signatureY + 44,
      startX + colWidth * 3 - 5,
      signatureY + 44
    );
    doc.line(
      startX + colWidth * 3 + 5,
      signatureY + 44,
      startX + colWidth * 4 - 5,
      signatureY + 44
    );

    // Simpan PDF
    doc.save(
      `daftar-lembur-${
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
          <div className="grid grid-cols-5 gap-2 mb-6">
            {!isSuperAdmin ? (
              <button
                className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
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
              className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
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
                className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
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
              className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "laukPauk"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("laukPauk")}
            >
              <span className="material-icons text-base">restaurant</span>
              Rekap Lauk Pauk
            </button>
            <button
              className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "controlPresensi"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("controlPresensi")}
            >
              <span className="material-icons text-base">settings</span>
              Kontrol Presensi
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
                  <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
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
                  <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
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
                    <>
                      <div className="text-sm text-gray-600 mb-2">
                        Dipilih: {selectedLembur.length} dari{" "}
                        {lemburData.length} pegawai
                      </div>
                      <button
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={handleDownloadSuratTugasLembur}
                        disabled={selectedLembur.length === 0}
                      >
                        <span className="material-icons text-base">
                          description
                        </span>
                        Surat Tugas
                      </button>
                      <button
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={handleDownloadDaftarLembur}
                        disabled={selectedLembur.length === 0}
                      >
                        <span className="material-icons text-base">
                          download
                        </span>
                        Daftar Lembur
                      </button>
                    </>
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
                  {/* Info Tarif Lembur */}
                  {lemburData.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-icons text-blue-600">
                          info
                        </span>
                        <span className="font-semibold text-blue-800">
                          Informasi Tarif Lembur
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          <span className="text-gray-700">
                            Hari Aktif (Senin-Jumat):{" "}
                            <strong>Rp 30.000/jam</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                          <span className="text-gray-700">
                            Hari Libur (Sabtu-Minggu):{" "}
                            <strong>Rp 60.000/jam</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="min-w-[130%] text-xs border border-gray-200 overflow-hidden shadow-sm">
                      <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                        <tr>
                          <th className="px-2 py-4 text-center font-extrabold text-emerald-700 tracking-wide uppercase w-12 text-base">
                            <input
                              type="checkbox"
                              checked={
                                lemburData &&
                                lemburData.length > 0 &&
                                selectedLembur.length === lemburData.length &&
                                selectedLembur.length > 0
                              }
                              onChange={handleSelectAllLembur}
                              className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                            />
                          </th>
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
                          <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                            Tarif/Jam
                          </th>
                          <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {lemburData?.length > 0 ? (
                          lemburData?.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className={
                                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-2 py-4 text-center align-middle border-b border-gray-100">
                                <input
                                  type="checkbox"
                                  checked={selectedLembur.includes(idx)}
                                  onChange={() => {
                                    console.log(
                                      "Checkbox clicked for row:",
                                      idx,
                                      "ID:",
                                      row.id
                                    );
                                    handleLemburCheckbox(idx);
                                  }}
                                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                                />
                              </td>
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
                              <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-700 text-sm">
                                {(() => {
                                  const tanggal = new Date(row?.tanggal);
                                  const hariLibur =
                                    tanggal.getDay() === 0 ||
                                    tanggal.getDay() === 6;
                                  const tarifPerJam = hariLibur ? 60000 : 30000;
                                  return `Rp ${tarifPerJam.toLocaleString(
                                    "id-ID"
                                  )}`;
                                })()}
                              </td>
                              <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-green-600 text-sm">
                                {(() => {
                                  const durasiJam = Math.floor(
                                    (row?.menit_overtime || 0) / 60
                                  );
                                  const tanggal = new Date(row?.tanggal);
                                  const hariLibur =
                                    tanggal.getDay() === 0 ||
                                    tanggal.getDay() === 6;
                                  const tarifPerJam = hariLibur ? 60000 : 30000;
                                  const total = durasiJam * tarifPerJam;
                                  return `Rp ${total.toLocaleString("id-ID")}`;
                                })()}
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

                    {/* Summary Cards */}
                    {lemburData?.length > 0 && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Pegawai */}
                        <div className="bg-white border border-gray-200 shadow-sm p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Total Pegawai
                              </p>
                              <p className="text-2xl font-bold text-emerald-600">
                                {lemburData.length}
                              </p>
                            </div>
                            <div className="p-3 bg-emerald-100">
                              <span className="material-icons text-emerald-600 text-xl">
                                people
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Total Jam Lembur */}
                        <div className="bg-white border border-gray-200 shadow-sm p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Total Jam Lembur
                              </p>
                              <p className="text-2xl font-bold text-blue-600">
                                {(() => {
                                  const totalJam = lemburData.reduce(
                                    (sum, row) => {
                                      return (
                                        sum +
                                        Math.floor(
                                          (row?.menit_overtime || 0) / 60
                                        )
                                      );
                                    },
                                    0
                                  );
                                  return `${totalJam} Jam`;
                                })()}
                              </p>
                            </div>
                            <div className="p-3 bg-blue-100">
                              <span className="material-icons text-blue-600 text-xl">
                                schedule
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Total Gaji Lembur */}
                        <div className="bg-white border border-gray-200 shadow-sm p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Total Gaji Lembur
                              </p>
                              <p className="text-2xl font-bold text-green-600">
                                {(() => {
                                  const totalLembur = lemburData.reduce(
                                    (sum, row) => {
                                      const durasiJam = Math.floor(
                                        (row?.menit_overtime || 0) / 60
                                      );
                                      const tanggal = new Date(row?.tanggal);
                                      const hariLibur =
                                        tanggal.getDay() === 0 ||
                                        tanggal.getDay() === 6;
                                      const tarifPerJam = hariLibur
                                        ? 60000
                                        : 30000;
                                      return sum + durasiJam * tarifPerJam;
                                    },
                                    0
                                  );
                                  return `Rp ${totalLembur.toLocaleString(
                                    "id-ID"
                                  )}`;
                                })()}
                              </p>
                            </div>
                            <div className="p-3 bg-green-100">
                              <span className="material-icons text-green-600 text-xl">
                                attach_money
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Rata-rata per Pegawai */}
                        <div className="bg-white border border-gray-200 shadow-sm p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Rata-rata per Pegawai
                              </p>
                              <p className="text-2xl font-bold text-purple-600">
                                {(() => {
                                  const totalLembur = lemburData.reduce(
                                    (sum, row) => {
                                      const durasiJam = Math.floor(
                                        (row?.menit_overtime || 0) / 60
                                      );
                                      const tanggal = new Date(row?.tanggal);
                                      const hariLibur =
                                        tanggal.getDay() === 0 ||
                                        tanggal.getDay() === 6;
                                      const tarifPerJam = hariLibur
                                        ? 60000
                                        : 30000;
                                      return sum + durasiJam * tarifPerJam;
                                    },
                                    0
                                  );
                                  const rataRata = Math.round(
                                    totalLembur / lemburData.length
                                  );
                                  return `Rp ${rataRata.toLocaleString(
                                    "id-ID"
                                  )}`;
                                })()}
                              </p>
                            </div>
                            <div className="p-3 bg-purple-100">
                              <span className="material-icons text-purple-600 text-xl">
                                trending_up
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
                  {units.map((unit) => {
                    const level = parseInt(unit?.level) || 0;
                    const indent = "\u00A0".repeat(level * 4);

                    // Icon berdasarkan level
                    let icon = "";
                    if (level === 0) {
                      icon = "🏢"; // Building untuk level 0 (root)
                    } else if (level === 1) {
                      icon = "📁"; // Folder untuk level 1
                    } else if (level === 2) {
                      icon = "📂"; // Open folder untuk level 2
                    } else if (level === 3) {
                      icon = "📄"; // Document untuk level 3
                    } else if (level === 4) {
                      icon = "📋"; // Clipboard untuk level 4
                    } else {
                      icon = "🧾"; // Link untuk level 5+
                    }

                    return (
                      <option key={unit.id} value={unit.id}>
                        {indent}
                        {icon} {unit?.nama}
                      </option>
                    );
                  })}
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
                    <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
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
                    <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
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
                              TIDAK HADIR
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
                              TIDAK ABSEN MASUK
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-32">
                              TIDAK ABSEN PULANG
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">
                              LEMBUR
                            </th>
                            <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-28">
                              BELUM PRESENSI
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
                                  {row.hadir}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-sky-100 text-sky-800 rounded">
                                  {row.izin}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                                  {row.sakit}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                                  {row.cuti}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                                  {row.tidak_hadir}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                                  {row.dinas}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded">
                                  {row.terlambat}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-pink-100 text-pink-800 rounded">
                                  {row.pulang_awal}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded">
                                  {row.tidak_absen_masuk}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-teal-100 text-teal-800 rounded">
                                  {row.tidak_absen_pulang}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded">
                                  {row.lembur}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-800 rounded">
                                  {row.belum_presensi}
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
          {tab === "controlPresensi" && <SettingPresensi />}
        </div>
      </div>
    </div>
  );
}
