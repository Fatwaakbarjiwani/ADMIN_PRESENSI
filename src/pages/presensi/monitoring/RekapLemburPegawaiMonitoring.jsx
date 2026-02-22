import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchLembur } from "../../../redux/actions/presensiAction";
import { fetchMonitoringUnits } from "../../../redux/actions/adminMonitoringAction";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC...";

export default function RekapLemburPegawaiMonitoring() {
  const dispatch = useDispatch();
  const { lemburData } = useSelector((state) => state.presensi);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [unitId, setUnitId] = useState("");
  const [monitoringUnits, setMonitoringUnits] = useState([]);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
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
      dispatch(fetchMonitoringUnits())
        .then((res) => setMonitoringUnits(Array.isArray(res) ? res : []))
        .catch(() => setMonitoringUnits([]));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (token && unitId) {
      dispatch(fetchLembur(bulan, tahun, "", false, unitId));
    }
  }, [token, dispatch, bulan, tahun, unitId]);

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
      setSelectedLembur((prev) =>
        prev.filter((idx) => !filteredIndices.includes(idx))
      );
    } else {
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

  const fetchLaporanLembur = async () => {
    if (!unitId) return;
    setLoadingLembur(true);
    dispatch(fetchLembur(bulan, tahun, "", false, unitId)).finally(() =>
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

  const getDateRange = () => {
    const firstDay = new Date(tahun, bulan - 1, 1);
    const lastDay = new Date(tahun, bulan, 0);
    const minDate = firstDay.toISOString().split("T")[0];
    const maxDate = lastDay.toISOString().split("T")[0];
    return { minDate, maxDate };
  };

  const { minDate, maxDate } = getDateRange();

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

    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("SURAT TUGAS", 105, 25, { align: "center" });
    doc.setFontSize(8);
    doc.text("Nomor :", 85, 28, { align: "center" });
    const today = new Date();
    const monthRoman =
      [
        "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII",
      ][today.getMonth() + 1];
    const year = today.getFullYear();
    doc.text(`/Set-YBW-SA/${monthRoman}/${year}`, 115, 28, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text(
      "Yayasan Badan Wakaf Sultan Agung (YBW-SA) memberi tugas lembur kepada,",
      20,
      35
    );

    autoTable(doc, {
      startY: 45,
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

    doc.text("Semarang, tgl", 105, finalY + 15, { align: "center" });

    const signatureY = finalY + 25;
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

    const tembusanY = signatureY + 35;
    doc.setFont("times", "normal");
    doc.text("Tembusan Yth.:", 20, tembusanY);
    doc.text("Kepala Bagian Keuangan dan Akuntansi YBW-SA", 20, tembusanY + 5);

    doc.save(
      `surat-tugas-lembur-${
        bulanOptions.find((b) => b.value === bulan)?.label
      }-${tahun}.pdf`
    );
  };

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

    const maxRowsPerPage = 15;
    const dataChunks = [];
    for (let i = 0; i < filteredData.length; i += maxRowsPerPage) {
      dataChunks.push(filteredData.slice(i, i + maxRowsPerPage));
    }

    const tableStartY = 25;
    let startX = 10;
    const pageWidth = doc.internal.pageSize.width;
    const tableMarginLeft = 10;
    const tableMarginRight = 10;
    const boxWidth = pageWidth - tableMarginLeft - tableMarginRight;
    const colWidth = boxWidth / 4;

    const drawSignature = (signatureY) => {
      const dateY = signatureY;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Semarang", 120, dateY + 5, { align: "center" });
      doc.text("Yayasan Badan Wakaf Sultan Agung", 120, dateY + 10, {
        align: "center",
      });

      const boxY = dateY + 15;
      const boxHeight = 40;
      doc.setLineWidth(0.5);
      doc.rect(startX, boxY, boxWidth, boxHeight);

      doc.line(startX + colWidth, boxY, startX + colWidth, boxY + boxHeight);
      doc.line(startX + colWidth * 2, boxY, startX + colWidth * 2, boxY + boxHeight);
      doc.line(startX + colWidth * 3, boxY, startX + colWidth * 3, boxY + boxHeight);

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("Disetujui Oleh", startX + colWidth / 2, boxY + 5, {
        align: "center",
      });
      doc.text("Sekretaris YBW-SA", startX + colWidth / 2, boxY + 14, {
        align: "center",
      });
      doc.setFont("helvetica", "bold");
      doc.text(
        "Dr. Muhammad Ja'far Shodiq., SE., S.Si., M.Si., Ak., CA.",
        startX + colWidth / 2,
        boxY + 35,
        { align: "center" }
      );

      doc.setFont("helvetica", "normal");
      doc.text("Diketahui Oleh", startX + colWidth + colWidth / 2, boxY + 5, {
        align: "center",
      });
      doc.text(
        "Kepala Sekretariat YBW-SA",
        startX + colWidth + colWidth / 2,
        boxY + 14,
        { align: "center" }
      );
      doc.setFont("helvetica", "bold");
      doc.text(
        "Ifan Rikhza Auladi, S.Pd., M.Ed.",
        startX + colWidth + colWidth / 2,
        boxY + 35,
        { align: "center" }
      );

      doc.setFont("helvetica", "normal");
      doc.text("Diperiksa Oleh", startX + colWidth * 2 + colWidth / 2, boxY + 5, {
        align: "center",
      });
      doc.text(
        "Kabag. SDI Sekretariat YBW-SA",
        startX + colWidth * 2 + colWidth / 2,
        boxY + 14,
        { align: "center" }
      );
      doc.setFont("helvetica", "bold");
      doc.text(
        "Ahmad Rudi Yulianto",
        startX + colWidth * 2 + colWidth / 2,
        boxY + 35,
        { align: "center" }
      );

      const nameStr = String(user?.name ?? "").toLowerCase();
      const unitStr = String(user?.unit ?? "").toLowerCase();
      const isYbwsaUser = nameStr.includes("ybw") || unitStr.includes("ybw");
      doc.setFont("helvetica", "normal");
      doc.text("Dibuat Oleh", startX + colWidth * 3 + colWidth / 2, boxY + 5, {
        align: "center",
      });
      if (isYbwsaUser) {
        doc.text(
          "SDI Sekretariat YBW-SA",
          startX + colWidth * 3 + colWidth / 2,
          boxY + 14,
          { align: "center" }
        );
        doc.setFont("helvetica", "bold");
        doc.text("Samsul Alam", startX + colWidth * 3 + colWidth / 2, boxY + 35, {
          align: "center",
        });
      }

      doc.setLineWidth(0.3);
      doc.line(startX + 5, boxY + 36, startX + colWidth - 5, boxY + 36);
      doc.line(
        startX + colWidth + 5,
        boxY + 36,
        startX + colWidth * 2 - 5,
        boxY + 36
      );
      doc.line(
        startX + colWidth * 2 + 5,
        boxY + 36,
        startX + colWidth * 3 - 5,
        boxY + 36
      );
      doc.line(
        startX + colWidth * 3 + 5,
        boxY + 36,
        startX + boxWidth - 5,
        boxY + 36
      );
    };

    dataChunks.forEach((chunk, chunkIndex) => {
      if (chunkIndex > 0) {
        doc.addPage();
      }

      const globalStartIndex = chunkIndex * maxRowsPerPage;

      const tableBody = chunk.map((row, idx) => {
        const durasiJam = Math.floor((row?.menit_overtime || 0) / 60);
        const globalIndex = globalStartIndex + idx;

        return [
          globalIndex + 1,
          row.no_ktp || "-",
          row?.nama || "-",
          row?.unit_detail || "-",
          row?.jabatan || "-",
          `${row?.waktu_masuk || "-"} - ${row?.waktu_pulang || "-"}`,
          durasiJam,
          `Rp ${(parseInt(row?.nom_lembur) || 0).toLocaleString("id-ID")}`,
          `Rp ${(parseInt(row?.total_nom_lembur) || 0).toLocaleString("id-ID")}`,
          globalIndex + 1,
        ];
      });

      const isLastChunk = chunkIndex === dataChunks.length - 1;
      const isExact15OrLess = chunk.length <= maxRowsPerPage && isLastChunk;
      let adjustedStartY = tableStartY;

      if (isExact15OrLess && chunk.length === maxRowsPerPage) {
        adjustedStartY = 15;
      } else if (isExact15OrLess) {
        adjustedStartY = 20;
      }

      const tableConfig = {
        startY: adjustedStartY,
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
        body: tableBody,
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
        styles: {
          cellPadding: 2,
          font: "helvetica",
        },
        margin: { top: adjustedStartY, left: 10, right: 10 },
        tableWidth: "auto",
      };

      if (isLastChunk) {
        tableConfig.foot = [
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
        ];
        tableConfig.footStyles = {
          fontSize: 8,
          halign: "center",
          fontStyle: "bold",
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
        };
      }

      autoTable(doc, tableConfig);

      if (isLastChunk) {
        const tableEndY = doc.lastAutoTable.finalY;
        const pageHeight = doc.internal.pageSize.height;
        const requiredHeight = 55;
        const marginBottom = 5;

        let relativeY = tableEndY % pageHeight;
        if (relativeY === 0) {
          relativeY = pageHeight;
        }

        if (relativeY + requiredHeight + marginBottom <= pageHeight) {
          const signatureY = relativeY + 1;
          drawSignature(signatureY);
        } else {
          doc.addPage();
          drawSignature(5);
        }
      }
    });

    doc.save(
      `daftar-lembur-${
        bulanOptions.find((b) => b.value === bulan)?.label
      }-${tahun}.pdf`
    );
  };

  if (!unitId) {
    return (
      <div className="bg-white border-2 border-emerald-200 shadow-lg">
        <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2">
              <span className="material-icons text-lg text-emerald-600">schedule</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">Rekap Lembur Pegawai</h3>
              <p className="text-white/80 text-xs font-medium">Pilih unit untuk melihat data lembur</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
          <select
            className="w-full max-w-md px-4 py-2.5 border-2 border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
          >
            <option value="">-- Pilih Unit --</option>
            {monitoringUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nama || u.name || `Unit ${u.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="material-icons text-emerald-600">filter_list</span>
            Filter Data Lembur
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <span className="material-icons text-base text-emerald-600">business</span>
              Unit
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            >
              <option value="">-- Pilih Unit --</option>
              {monitoringUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama || u.name || `Unit ${u.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <span className="material-icons text-base text-emerald-600">calendar_month</span>
              Bulan
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm"
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
              <span className="material-icons text-base text-emerald-600">event</span>
              Tahun
            </label>
            <input
              type="number"
              className="w-full px-4 py-2.5 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              min="2000"
              max={new Date().getFullYear() + 1}
            />
          </div>
          <div>
            <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
              <span className="material-icons text-base text-emerald-600">calendar_today</span>
              Filter Tanggal
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              min={minDate}
              max={maxDate}
            />
            {filterTanggal && (
              <button
                type="button"
                onClick={() => setFilterTanggal("")}
                className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                <span className="material-icons text-sm">close</span>
                Hapus Filter
              </button>
            )}
          </div>
          <div className="flex flex-col">
            <div className="h-7 mb-2"></div>
            <button
              className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={fetchLaporanLembur}
              disabled={loadingLembur}
            >
              {loadingLembur ? (
                <>
                  <span className="material-icons animate-spin text-base">refresh</span>
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

        {filteredLemburData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-md">
                <span className="material-icons text-emerald-600 text-lg">info</span>
                <span className="text-sm font-medium text-gray-700">
                  Dipilih: <span className="font-bold text-emerald-600">{selectedLembur.length}</span> dari{" "}
                  <span className="font-bold text-emerald-600">{filteredLemburData.length}</span> pegawai
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md"
                  onClick={handleDownloadSuratTugasLembur}
                  disabled={selectedLembur.length === 0}
                >
                  <span className="material-icons text-base">description</span>
                  Surat Tugas
                </button>
                <button
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md"
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
                          const filteredIndices = filteredLemburData.map((filteredRow) => {
                            return lemburData.findIndex(
                              (row) =>
                                row.no_ktp === filteredRow.no_ktp &&
                                row.tanggal === filteredRow.tanggal &&
                                row.waktu_masuk === filteredRow.waktu_masuk
                            );
                          });
                          return (
                            filteredIndices.length > 0 &&
                            filteredIndices.every((idx) => selectedLembur.includes(idx))
                          );
                        })()
                      }
                      onChange={handleSelectAllLembur}
                      className="w-5 h-5 text-emerald-600 bg-white border-gray-300 focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider w-12">
                    <span className="material-icons text-lg">format_list_numbered</span>
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-32">NIK</th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-56">Nama</th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-40">Jabatan</th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-40">Unit</th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-40">Tanggal</th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-40">Waktu Masuk</th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider w-40">Waktu Pulang</th>
                  <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider w-40">Lembur</th>
                  <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider w-32">Nominal Lembur</th>
                  <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider w-32">Nominal Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredLemburData?.length > 0 ? (
                  filteredLemburData?.map((row, idx) => {
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
                            onChange={() => handleLemburCheckbox(originalIdx)}
                            className="w-5 h-5 text-emerald-600 bg-white border-gray-300 focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 text-center align-middle font-semibold text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-3 align-middle text-gray-700 font-mono text-xs">{row.no_ktp || "-"}</td>
                        <td className="px-4 py-3 align-middle font-semibold text-gray-800">{row.nama || "-"}</td>
                        <td className="px-4 py-3 align-middle text-gray-700">{row?.jabatan || "-"}</td>
                        <td className="px-4 py-3 align-middle text-gray-700">{row?.unit_detail || "-"}</td>
                        <td className="px-4 py-3 align-middle text-gray-700">{formatTanggal(row?.tanggal)}</td>
                        <td className="px-4 py-3 align-middle text-gray-700 font-mono">{row?.waktu_masuk || "-"}</td>
                        <td className="px-4 py-3 align-middle text-gray-700 font-mono">{row?.waktu_pulang || "-"}</td>
                        <td className="px-4 py-3 text-center align-middle">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800">
                            {formatOvertime(row?.menit_overtime)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center align-middle font-semibold text-emerald-600">
                          {row?.nom_lembur ? `Rp ${parseInt(row.nom_lembur || 0).toLocaleString("id-ID")}` : "Rp 0"}
                        </td>
                        <td className="px-4 py-3 text-center align-middle font-bold text-emerald-700">
                          {row?.total_nom_lembur ? `Rp ${parseInt(row.total_nom_lembur || 0).toLocaleString("id-ID")}` : "Rp 0"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={12} className="text-center text-gray-400 py-8">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-icons text-4xl text-gray-300">watch</span>
                        <span className="font-semibold">Tidak ada data lembur pegawai</span>
                        <span className="text-sm">Data lembur pegawai kosong</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {filteredLemburData?.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                <div className="bg-white border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Pegawai</p>
                      <p className="text-2xl font-bold text-emerald-600">{filteredLemburData.length}</p>
                    </div>
                    <div className="p-3 bg-emerald-100">
                      <span className="material-icons text-emerald-600 text-xl">people</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Jam Lembur</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {filteredLemburData.reduce((sum, row) => sum + Math.floor((row?.menit_overtime || 0) / 60), 0)} Jam
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100">
                      <span className="material-icons text-emerald-600 text-xl">schedule</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Gaji Lembur</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        Rp{" "}
                        {filteredLemburData
                          .reduce((sum, row) => sum + (parseInt(row?.total_nom_lembur) || 0), 0)
                          .toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100">
                      <span className="material-icons text-emerald-600 text-xl">attach_money</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rata-rata per Pegawai</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        Rp{" "}
                        {Math.round(
                          filteredLemburData.reduce((sum, row) => sum + (parseInt(row?.total_nom_lembur) || 0), 0) /
                            filteredLemburData.length
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100">
                      <span className="material-icons text-emerald-600 text-xl">trending_up</span>
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
