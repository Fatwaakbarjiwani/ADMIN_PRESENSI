import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchLembur } from "../../../redux/actions/presensiAction";
import { fetchAllUnit } from "../../../redux/actions/unitDetailAction";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC...";

export default function RekapLemburPegawai() {
  const dispatch = useDispatch();
  const { lemburData } = useSelector((state) => state.presensi);
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super_admin";
  const token = useSelector((state) => state.auth.token);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const filterUnit = "";
  const [selectedLembur, setSelectedLembur] = useState([]);
  const [loadingLembur, setLoadingLembur] = useState(false);
  const [filterTanggal, setFilterTanggal] = useState("");

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

  useEffect(() => {
    if (token) {
      dispatch(fetchLembur(bulan, tahun, filterUnit, isSuperAdmin));
      dispatch(fetchAllUnit());
    }
  }, [token, dispatch, bulan, tahun, filterUnit, isSuperAdmin]);

  useEffect(() => {
    setSelectedLembur([]);
  }, [lemburData, filterTanggal]);

  useEffect(() => {
    if (filterTanggal) {
      const selectedDate = new Date(filterTanggal);
      const selectedMonth = selectedDate.getMonth() + 1;
      const selectedYear = selectedDate.getFullYear();

      if (selectedMonth !== bulan || selectedYear !== tahun) {
        setFilterTanggal("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulan, tahun]);

  const handleLemburCheckbox = (index) => {
    setSelectedLembur((prev) => {
      if (prev.includes(index)) {
        return prev.filter((idx) => idx !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSelectAllLembur = () => {
    if (!filteredLemburData || filteredLemburData.length === 0) return;

    // Buat mapping index dari filteredLemburData ke lemburData
    const filteredIndices = filteredLemburData.map((filteredRow) => {
      return lemburData.findIndex(
        (row) =>
          row.no_ktp === filteredRow.no_ktp &&
          row.tanggal === filteredRow.tanggal &&
          row.waktu_masuk === filteredRow.waktu_masuk
      );
    });

    const allFilteredSelected = filteredIndices.every((idx) =>
      selectedLembur.includes(idx)
    );

    if (allFilteredSelected) {
      // Hapus semua yang terfilter
      setSelectedLembur((prev) =>
        prev.filter((idx) => !filteredIndices.includes(idx))
      );
    } else {
      // Tambahkan semua yang terfilter
      setSelectedLembur((prev) => {
        const newSelected = [...prev];
        filteredIndices.forEach((idx) => {
          if (!newSelected.includes(idx)) {
            newSelected.push(idx);
          }
        });
        return newSelected;
      });
    }
  };

  const fetchLaporanLembur = async (bulan, tahun) => {
    setLoadingLembur(true);
    dispatch(fetchLembur(bulan, tahun, filterUnit, isSuperAdmin)).finally(() =>
      setLoadingLembur(false)
    );
  };

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

  // Fungsi untuk mendapatkan min dan max date berdasarkan bulan dan tahun
  const getDateRange = () => {
    const firstDay = new Date(tahun, bulan - 1, 1);
    const lastDay = new Date(tahun, bulan, 0); // Hari terakhir dari bulan

    const minDate = firstDay.toISOString().split("T")[0];
    const maxDate = lastDay.toISOString().split("T")[0];

    return { minDate, maxDate };
  };

  const { minDate, maxDate } = getDateRange();

  // Fungsi untuk memfilter data berdasarkan tanggal
  const getFilteredLemburData = () => {
    if (!filterTanggal) return lemburData || [];

    const filterDate = new Date(filterTanggal);
    filterDate.setHours(0, 0, 0, 0);

    return (lemburData || []).filter((row) => {
      if (!row.tanggal) return false;
      const rowDate = new Date(row.tanggal);
      rowDate.setHours(0, 0, 0, 0);
      return rowDate.getTime() === filterDate.getTime();
    });
  };

  const filteredLemburData = getFilteredLemburData();

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

    const doc = new jsPDF("p", "mm", "a4");

    try {
      doc.addImage(logoBase64, "PNG", 20, 20, 30, 30);
    } catch {
      void 0;
    }

    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text("SURAT TUGAS", 105, 50, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text(
      "Yayasan Badan Wakaf Sultan Agung (YBW-SA) memberi tugas lembur kepada,",
      20,
      65
    );

    autoTable(doc, {
      startY: 70,
      head: [["No.", "Nama", "Jabatan", "Tugas", "Total Nominal Lembur"]],
      body: filteredData.map((row, idx) => [
        idx + 1,
        row?.nama || "-",
        row?.jabatan || "-",
        `Lembur ${formatTanggal(row?.tanggal)}`,
        `Rp ${(parseInt(row?.total_nom_lembur) || 0).toLocaleString("id-ID")}`,
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

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text(
      "Untuk melaksanakan tugas kerja lembur pada hari Senin tanggal 29 September 2025",
      20,
      finalY
    );
    doc.text("Demikian untuk menjadikan periksa", 20, finalY + 6);

    doc.text("Semarang", 105, finalY + 20, { align: "center" });

    const signatureY = finalY + 35;
    doc.setFontSize(10);

    doc.setFont("times", "normal");
    doc.text("Mengetahui", 60, signatureY, { align: "center" });
    doc.text("Pengurus Yayasan Badan Wakaf Sultan Agung", 60, signatureY + 5, {
      align: "center",
    });
    doc.text("Sekretaris", 60, signatureY + 10, { align: "center" });
    doc.setFont("times", "bold");
    doc.text(
      "Dr. Muhammad Ja'far Shodiq, SE., S.Si., M.Si., Ak., CA.",
      60,
      signatureY + 25,
      { align: "center" }
    );
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

    doc.setFont("times", "normal");
    doc.text("Sekretariat YBW-SA", 150, signatureY, { align: "center" });
    doc.text("Kepala", 150, signatureY + 10, { align: "center" });
    doc.setFont("times", "bold");
    doc.text("Ifan Rikhza Auladi, S.Pd., M.Ed", 150, signatureY + 25, {
      align: "center",
    });
    const name2Width = doc.getTextWidth("Ifan Rikhza Auladi, S.Pd., M.Ed");
    doc.line(
      150 - name2Width / 2,
      signatureY + 27,
      150 + name2Width / 2,
      signatureY + 27
    );

    const tembusanY = signatureY + 50;
    doc.setFont("times", "normal");
    doc.text("Tembusan Yth.:", 20, tembusanY);
    doc.text("Kepala Bagian Keuangan dan Akuntansi YBW-SA", 20, tembusanY + 5);

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

    const doc = new jsPDF("l", "mm", "a4");

    const totalLembur = filteredData.reduce((sum, row) => {
      return sum + (parseInt(row?.total_nom_lembur) || 0);
    }, 0);

    const tableStartY = 50;
    autoTable(doc, {
      startY: tableStartY,
      head: [
        [
          "No.",
          "NIK",
          "Nama",
          "Bidang/Bagian",
          "Jabatan",
          "Waktu",
          "Durasi (Jam)",
          "Nominal Lembur",
          "Total Nominal Lembur",
          "TTD",
        ],
      ],
      body: filteredData.map((row, idx) => {
        const durasiJam = Math.floor((row?.menit_overtime || 0) / 60);

        return [
          idx + 1,
          row.no_ktp || "-",
          row?.nama || "-",
          row?.unit_detail || "-",
          row?.jabatan || "-",
          `${row?.waktu_masuk || "-"} - ${row?.waktu_pulang || "-"}`,
          durasiJam,
          `Rp ${(parseInt(row?.nom_lembur) || 0).toLocaleString("id-ID")}`,
          `Rp ${(parseInt(row?.total_nom_lembur) || 0).toLocaleString(
            "id-ID"
          )}`,
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
      margin: { top: tableStartY, left: 10, right: 10 },
      tableWidth: "auto",
    });

    // Cek apakah masih ada space di halaman yang sama dengan tabel
    const tableEndY = doc.lastAutoTable.finalY;
    const pageHeight = doc.internal.pageSize.height; // Untuk landscape A4 = 210mm
    const requiredHeight = 90; // Tinggi yang dibutuhkan: tanggal (20) + box (50) + margin (20)
    const marginBottom = 10; // Margin bawah minimum

    let signatureY;
    let startX = 10;
    const colWidth = 70;

    // Hitung posisi Y relatif terhadap halaman saat ini
    // Jika tableEndY lebih kecil dari pageHeight, berarti masih di halaman pertama
    // Jika lebih besar, berarti sudah di halaman berikutnya
    const isOnFirstPage = tableEndY <= pageHeight;
    const relativeY = isOnFirstPage ? tableEndY : tableEndY % pageHeight;

    // Cek apakah masih ada space di halaman yang sama dengan tabel
    if (
      isOnFirstPage &&
      relativeY + requiredHeight + marginBottom <= pageHeight
    ) {
      // Jika masih ada space di halaman pertama, gunakan space yang tersedia di bawah tabel
      signatureY = tableEndY + 15; // Spasi setelah tabel
    } else {
      // Jika tidak cukup space atau sudah di halaman berikutnya, buat halaman baru
      doc.addPage();
      signatureY = 30;
    }

    // Posisi untuk tanggal dan tempat
    const dateY = signatureY;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Semarang", 120, dateY, { align: "center" });
    doc.text("Yayasan Badan Wakaf Sultan Agung", 120, dateY + 8, {
      align: "center",
    });

    // Posisi untuk box tanda tangan
    const boxY = dateY + 20;
    doc.setLineWidth(0.5);
    doc.rect(startX, boxY, colWidth * 4, 50);

    doc.line(startX + colWidth, boxY, startX + colWidth, boxY + 50);
    doc.line(startX + colWidth * 2, boxY, startX + colWidth * 2, boxY + 50);
    doc.line(startX + colWidth * 3, boxY, startX + colWidth * 3, boxY + 50);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Disetujui Oleh", startX + colWidth / 2, boxY + 8, {
      align: "center",
    });
    doc.text("Sekretaris YBW-SA", startX + colWidth / 2, boxY + 22, {
      align: "center",
    });
    doc.setFont("helvetica", "bold");
    doc.text(
      "Dr. Muhammad Ja'far Shodiq., SE., S.Si., M.Si., Ak., CA.",
      startX + colWidth / 2,
      boxY + 42,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.text("Diketahui Oleh", startX + colWidth + colWidth / 2, boxY + 8, {
      align: "center",
    });
    doc.text(
      "Kepala Sekretariat YBW-SA",
      startX + colWidth + colWidth / 2,
      boxY + 22,
      { align: "center" }
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      "Ifan Rikhza Auladi, S.Pd., M.Ed.",
      startX + colWidth + colWidth / 2,
      boxY + 42,
      { align: "center" }
    );

    doc.setFont("helvetica", "normal");
    doc.text("Diperiksa Oleh", startX + colWidth * 2 + colWidth / 2, boxY + 8, {
      align: "center",
    });
    doc.text(
      "Kabag. SDI Sekretariat YBW-SA",
      startX + colWidth * 2 + colWidth / 2,
      boxY + 22,
      { align: "center" }
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      "Ahmad Rudi Yulianto",
      startX + colWidth * 2 + colWidth / 2,
      boxY + 42,
      { align: "center" }
    );

    const nameStr = String(user?.name ?? "").toLowerCase();
    const unitStr = String(user?.unit ?? "").toLowerCase();
    const isYbwsaUser = nameStr.includes("ybw") || unitStr.includes("ybw");
    doc.setFont("helvetica", "normal");
    doc.text("Dibuat Oleh", startX + colWidth * 3 + colWidth / 2, boxY + 8, {
      align: "center",
    });
    if (isYbwsaUser) {
      doc.text(
        "SDI Sekretariat YBW-SA",
        startX + colWidth * 3 + colWidth / 2,
        boxY + 22,
        { align: "center" }
      );
      doc.setFont("helvetica", "bold");
      doc.text("Samsul Alam", startX + colWidth * 3 + colWidth / 2, boxY + 42, {
        align: "center",
      });
    }

    doc.setLineWidth(0.3);
    doc.line(startX + 5, boxY + 44, startX + colWidth - 5, boxY + 44);
    doc.line(
      startX + colWidth + 5,
      boxY + 44,
      startX + colWidth * 2 - 5,
      boxY + 44
    );
    doc.line(
      startX + colWidth * 2 + 5,
      boxY + 44,
      startX + colWidth * 3 - 5,
      boxY + 44
    );
    doc.line(
      startX + colWidth * 3 + 5,
      boxY + 44,
      startX + colWidth * 4 - 5,
      boxY + 44
    );

    doc.save(
      `daftar-lembur-${
        bulanOptions.find((b) => b.value === bulan)?.label
      }-${tahun}.pdf`
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="material-icons text-emerald-600">filter_list</span>
            Filter Data Lembur
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <span className="material-icons text-base text-emerald-600">
                calendar_month
              </span>
              Bulan
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm hover:shadow-md"
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
          <div>
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <span className="material-icons text-base text-emerald-600">
                event
              </span>
              Tahun
            </label>
            <input
              type="number"
              className="w-full px-4 py-2.5 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm hover:shadow-md"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              min="2000"
              max={new Date().getFullYear() + 1}
            />
          </div>
          <div>
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <span className="material-icons text-base text-emerald-600">
                calendar_today
              </span>
              Filter Tanggal
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm hover:shadow-md"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              min={minDate}
              max={maxDate}
              title={`Pilih tanggal antara ${minDate} dan ${maxDate}`}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Hanya bisa memilih tanggal di bulan{" "}
              <span className="font-semibold text-emerald-600">
                {bulanOptions.find((b) => b.value === bulan)?.label} {tahun}
              </span>
            </p>
            {filterTanggal && (
              <button
                type="button"
                onClick={() => setFilterTanggal("")}
                className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition"
              >
                <span className="material-icons text-sm">close</span>
                Hapus Filter
              </button>
            )}
          </div>
          <div className="flex flex-col">
            <div className="h-7 mb-2"></div>
            <button
              className="w-full px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={() => fetchLaporanLembur(bulan, tahun)}
              disabled={loadingLembur}
            >
              {loadingLembur ? (
                <>
                  <span className="material-icons animate-spin text-base">
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
          </div>
        </div>

        {/* Action Buttons Section */}
        {filteredLemburData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-md">
                <span className="material-icons text-emerald-600 text-lg">
                  info
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Dipilih:{" "}
                  <span className="font-bold text-emerald-600">
                    {selectedLembur.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-emerald-600">
                    {filteredLemburData.length}
                  </span>{" "}
                  pegawai
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none rounded-md"
                  onClick={handleDownloadSuratTugasLembur}
                  disabled={selectedLembur.length === 0}
                >
                  <span className="material-icons text-base">description</span>
                  Surat Tugas
                </button>
                <button
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none rounded-md"
                  onClick={handleDownloadDaftarLembur}
                  disabled={selectedLembur.length === 0}
                >
                  <span className="material-icons text-base">download</span>
                  Daftar Lembur
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {loadingLembur ? (
        <div className="text-center py-12 text-emerald-600 font-bold flex items-center justify-center gap-2">
          <span className="material-icons animate-spin">refresh</span>
          Memuat data rekap lembur...
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={
                        filteredLemburData &&
                        filteredLemburData.length > 0 &&
                        (() => {
                          const filteredIndices = filteredLemburData.map(
                            (filteredRow) => {
                              return lemburData.findIndex(
                                (row) =>
                                  row.no_ktp === filteredRow.no_ktp &&
                                  row.tanggal === filteredRow.tanggal &&
                                  row.waktu_masuk === filteredRow.waktu_masuk
                              );
                            }
                          );
                          return (
                            filteredIndices.length > 0 &&
                            filteredIndices.every((idx) =>
                              selectedLembur.includes(idx)
                            )
                          );
                        })()
                      }
                      onChange={handleSelectAllLembur}
                      className="w-5 h-5 text-emerald-600 bg-white border-gray-300 focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider w-12">
                    <span className="material-icons text-lg">
                      format_list_numbered
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-32">
                    NIK
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-56">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-40">
                    Jabatan
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-40">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-40">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-40">
                    Waktu Masuk
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-40">
                    Waktu Pulang
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider w-40">
                    Lembur
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider w-32">
                    Nominal Lembur
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider w-32">
                    Nominal Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLemburData?.length > 0 ? (
                  filteredLemburData?.map((row, idx) => {
                    // Cari index di lemburData asli
                    const originalIdx = lemburData.findIndex(
                      (r) =>
                        r.no_ktp === row.no_ktp &&
                        r.tanggal === row.tanggal &&
                        r.waktu_masuk === row.waktu_masuk
                    );
                    return (
                      <tr
                        key={`${row.no_ktp}-${row.tanggal}-${idx}`}
                        className={`transition hover:bg-emerald-50 border-b border-gray-200 ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={selectedLembur.includes(originalIdx)}
                            onChange={() => {
                              handleLemburCheckbox(originalIdx);
                            }}
                            className="w-5 h-5 text-emerald-600 bg-white border-gray-300 focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-center align-middle font-semibold text-gray-700">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 align-middle text-gray-700 font-mono text-xs">
                          {row.no_ktp || "-"}
                        </td>
                        <td className="px-4 py-3 align-middle font-semibold text-gray-800">
                          {row.nama || "-"}
                        </td>
                        <td className="px-4 py-3 align-middle text-gray-700">
                          {row?.jabatan || "-"}
                        </td>
                        <td className="px-4 py-3 align-middle text-gray-700">
                          {row?.unit_detail || "-"}
                        </td>
                        <td className="px-4 py-3 align-middle text-gray-700">
                          {formatTanggal(row?.tanggal)}
                        </td>
                        <td className="px-4 py-3 align-middle text-gray-700 font-mono">
                          {row?.waktu_masuk || "-"}
                        </td>
                        <td className="px-4 py-3 align-middle text-gray-700 font-mono">
                          {row?.waktu_pulang || "-"}
                        </td>
                        <td className="px-4 py-3 text-center align-middle">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800">
                            {formatOvertime(row?.menit_overtime)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center align-middle font-semibold text-emerald-600">
                          {row?.nom_lembur
                            ? `Rp ${parseInt(
                                row.nom_lembur || 0
                              ).toLocaleString("id-ID")}`
                            : "Rp 0"}
                        </td>
                        <td className="px-4 py-3 text-center align-middle font-bold text-emerald-700">
                          {row?.total_nom_lembur
                            ? `Rp ${parseInt(
                                row.total_nom_lembur || 0
                              ).toLocaleString("id-ID")}`
                            : "Rp 0"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={12} className="text-center text-gray-400 py-8">
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

            {filteredLemburData?.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Pegawai
                      </p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {filteredLemburData.length}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100">
                      <span className="material-icons text-emerald-600 text-xl">
                        people
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Jam Lembur
                      </p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {(() => {
                          const totalJam = filteredLemburData.reduce(
                            (sum, row) => {
                              return (
                                sum +
                                Math.floor((row?.menit_overtime || 0) / 60)
                              );
                            },
                            0
                          );
                          return `${totalJam} Jam`;
                        })()}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100">
                      <span className="material-icons text-emerald-600 text-xl">
                        schedule
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Gaji Lembur
                      </p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {(() => {
                          const totalLembur = filteredLemburData.reduce(
                            (sum, row) => {
                              return (
                                sum + (parseInt(row?.total_nom_lembur) || 0)
                              );
                            },
                            0
                          );
                          return `Rp ${totalLembur.toLocaleString("id-ID")}`;
                        })()}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100">
                      <span className="material-icons text-emerald-600 text-xl">
                        attach_money
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Rata-rata per Pegawai
                      </p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {(() => {
                          const totalLembur = filteredLemburData.reduce(
                            (sum, row) => {
                              return (
                                sum + (parseInt(row?.total_nom_lembur) || 0)
                              );
                            },
                            0
                          );
                          const rataRata = Math.round(
                            totalLembur / filteredLemburData.length
                          );
                          return `Rp ${rataRata.toLocaleString("id-ID")}`;
                        })()}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100">
                      <span className="material-icons text-emerald-600 text-xl">
                        trending_up
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
