import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC...";

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

export default function HistoryPresensi() {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const isWeekend = (day, month, year) => {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const getPresensiCode = (row) => {
    if (!row) return "";

    const ketMasuk = (row.keterangan_masuk || "").toLowerCase();
    const ketPulang = (row.keterangan_pulang || "").toLowerCase();

    if (
      row.status_masuk !== "absen_masuk" ||
      ketMasuk.includes("tidak absen") ||
      ketMasuk.includes("belum absen")
    ) {
      return "TAM";
    }

    if (
      row.status_pulang !== "absen_pulang" ||
      ketPulang.includes("tidak absen") ||
      ketPulang.includes("belum absen")
    ) {
      return "TAP";
    }

    if (ketMasuk.includes("terlambat")) {
      return "TL";
    }

    if (
      ketPulang.includes("pulang sebelum") ||
      ketPulang.includes("sebelum waktunya")
    ) {
      return "PSW";
    }

    if (
      row.status_presensi === "hadir" ||
      ketMasuk.includes("tepat waktu") ||
      ketMasuk.includes("masuk tepat")
    ) {
      return "V";
    }

    return "V";
  };

  const getPresensiColor = (code) => {
    if (code === "V") return "bg-green-500 text-white";
    if (code === "TL" || code === "PSW") return "bg-orange-400 text-white";
    if (code === "TAM" || code === "TAP") return "bg-pink-400 text-white";
    return "bg-gray-200 text-gray-600";
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const groupedData = (dataToGroup = data) => {
    const grouped = {};
    const safeData = Array.isArray(dataToGroup) ? dataToGroup : [];
    if (safeData.length === 0) {
      return [];
    }
    safeData.forEach((row) => {
      if (!row.nama) return;

      let tanggal = null;
      if (row.waktu_masuk) {
        const dateStr = row.waktu_masuk.replace(" ", "T");
        tanggal = new Date(dateStr);
      } else if (row.tanggal) {
        tanggal = new Date(row.tanggal);
      }

      if (!tanggal || isNaN(tanggal.getTime())) return;

      const day = tanggal.getDate();
      const nama = row.nama;

      if (!grouped[nama]) {
        grouped[nama] = {
          nama: nama,
          no_ktp: row.no_ktp,
          days: {},
        };
      }

      if (!grouped[nama].days[day]) {
        grouped[nama].days[day] = row;
      } else {
        const existingDate = new Date(
          grouped[nama].days[day].updated_at ||
            grouped[nama].days[day].created_at ||
            0
        );
        const newDate = new Date(row.updated_at || row.created_at || 0);
        if (newDate > existingDate) {
          grouped[nama].days[day] = row;
        }
      }
    });

    return Object.values(grouped).sort((a, b) => a.nama.localeCompare(b.nama));
  };

  const fetchData = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      const bulanFormatted = bulan.toString().padStart(2, "0");
      const bulanParam = `${tahun}-${bulanFormatted}`;
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/presensi/history-by-unit?bulan=${bulanParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch {
          void 0;
        }
        console.error("API Error:", errorMessage);
        setData([]);
        setLoading(false);
        return;
      }

      const result = await response.json();
      if (Array.isArray(result)) {
        setData(result);
      } else if (result && result.data && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        console.warn("Unexpected response format:", result);
        setData([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [token, user, bulan, tahun]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadHistoryPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    try {
      doc.addImage(logoBase64, "PNG", 10, 10, 25, 25);
    } catch (e) {
      void e;
    }
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
    doc.setLineWidth(0.5);
    doc.line(10, 44, 287, 44);

    const daysInMonth = getDaysInMonth(bulan, tahun);
    const header = [
      "No",
      "Nama",
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    const safeDataForPDF = Array.isArray(data) ? data : [];
    const grouped = groupedData(safeDataForPDF);
    const body = grouped.map((pegawai, idx) => {
      const row = [idx + 1, pegawai.nama];
      for (let day = 1; day <= daysInMonth; day++) {
        const dayData = pegawai.days[day];
        row.push(getPresensiCode(dayData) || "");
      }
      return row;
    });

    autoTable(doc, {
      startY: 50,
      head: [header],
      body: body,
      headStyles: {
        fillColor: [22, 160, 133],
        halign: "center",
        fontStyle: "bold",
        fontSize: 7,
      },
      bodyStyles: { fontSize: 6, halign: "center" },
      styles: { cellPadding: 1, font: "helvetica" },
      margin: { left: 10, right: 10 },
      tableWidth: "auto",
    });
    const bulanLabel = bulanOptions.find((b) => b.value === bulan)?.label || "";
    const bulanParam = `${bulanLabel} ${tahun}`;
    doc.save(
      `history-presensi-${bulanParam.toLowerCase().replace(" ", "-")}.pdf`
    );
  };

  const safeData = Array.isArray(data) ? data : [];

  const daysInMonth = getDaysInMonth(bulan, tahun);
  const grouped = groupedData(safeData);

  return (
    <>
      {loading ? (
        <div className="text-center py-12 text-emerald-600 font-bold flex items-center justify-center gap-2">
          <span className="material-icons animate-spin">refresh</span>
          Memuat data history presensi...
        </div>
      ) : (
        <>
          <div className="bg-white border-2 border-emerald-200 shadow-lg mb-4">
            <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2">
                    <span className="material-icons text-lg text-emerald-600">
                      history
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wide">
                      History Presensi
                    </h3>
                    <p className="text-white/80 text-xs font-medium">
                      Data presensi harian pegawai
                    </p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 bg-white text-emerald-700 font-bold text-xs border-2 border-white/20 hover:bg-white/10 transition flex items-center gap-2"
                  onClick={handleDownloadHistoryPDF}
                  title="Download PDF"
                >
                  <span className="material-icons text-base">download</span>
                  Download PDF
                </button>
              </div>
            </div>
            <div className="p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <span className="material-icons">description</span>
                  <span className="font-semibold">
                    Total Data: {grouped.length} pegawai
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <label className="font-semibold">Bulan:</label>
                  <select
                    value={bulan}
                    onChange={(e) => setBulan(Number(e.target.value))}
                    className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none bg-white"
                  >
                    {bulanOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <label className="font-semibold">Tahun:</label>
                  <input
                    type="number"
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none bg-white w-24"
                  />
                </div>
                <button
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
                  onClick={fetchData}
                >
                  <span className="material-icons text-base">search</span>
                  Submit
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-emerald-200 p-4 mb-4">
            <div className="text-sm font-semibold text-emerald-800 mb-2">
              Keterangan:
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 flex items-center justify-center text-white font-bold">
                  V
                </div>
                <span className="text-gray-700">= Tepat Waktu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-400 flex items-center justify-center text-white font-bold">
                  TL
                </div>
                <span className="text-gray-700">= Terlambat Masuk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-400 flex items-center justify-center text-white font-bold">
                  PSW
                </div>
                <span className="text-gray-700">= Pulang Sebelum Waktunya</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-pink-400 flex items-center justify-center text-white font-bold">
                  TAM
                </div>
                <span className="text-gray-700">= Tidak Absen Masuk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-pink-400 flex items-center justify-center text-white font-bold">
                  TAP
                </div>
                <span className="text-gray-700">= Tidak Absen Pulang</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-2 border-emerald-200 overflow-hidden shadow-lg">
              <thead className="sticky top-0 z-10 bg-emerald-50 border-b-2 border-emerald-200">
                <tr>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-12">
                    <span className="material-icons text-base">
                      format_list_numbered
                    </span>
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-56">
                    Nama
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const isWeekendDay = isWeekend(day, bulan, tahun);
                    return (
                      <th
                        key={day}
                        className={`px-2 py-2 text-center font-black text-emerald-800 text-xs border-r border-emerald-200 ${
                          isWeekendDay ? "bg-gray-200" : ""
                        }`}
                      >
                        {day}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {grouped.length > 0 ? (
                  grouped.map((pegawai, idx) => (
                    <tr
                      key={`${pegawai.nama}-${idx}`}
                      className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                      }`}
                    >
                      <td className="px-3 py-2 text-center align-middle font-semibold border-r border-emerald-100">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 align-middle font-bold text-emerald-800 border-r border-emerald-100">
                        {pegawai.nama}
                      </td>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dayData = pegawai.days[day];
                        const code = getPresensiCode(dayData);
                        const isWeekendDay = isWeekend(day, bulan, tahun);
                        return (
                          <td
                            key={day}
                            className={`px-1 py-2 text-center align-middle border-r border-emerald-100 ${
                              isWeekendDay ? "bg-gray-200" : ""
                            }`}
                          >
                            {code ? (
                              <div
                                onClick={() => {
                                  if (dayData) {
                                    setSelectedDetail({
                                      ...dayData,
                                      tanggal: day,
                                      bulan: bulanOptions.find(
                                        (b) => b.value === bulan
                                      )?.label,
                                      tahun: tahun,
                                    });
                                    setShowDetailModal(true);
                                  }
                                }}
                                className={`w-8 h-8 mx-auto flex items-center justify-center font-bold text-xs cursor-pointer hover:opacity-80 transition ${getPresensiColor(
                                  code
                                )}`}
                                title="Klik untuk melihat detail"
                              >
                                {code}
                              </div>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={daysInMonth + 2}
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

          {showDetailModal && selectedDetail && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white border-2 border-emerald-200 shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="bg-emerald-600 px-6 py-4 border-b-2 border-emerald-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2">
                        <span className="material-icons text-lg text-emerald-600">
                          info
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wide">
                          Detail Absen
                        </h3>
                        <p className="text-white/80 text-xs font-medium">
                          {selectedDetail.nama} - {selectedDetail.tanggal}{" "}
                          {selectedDetail.bulan} {selectedDetail.tahun}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedDetail(null);
                      }}
                      className="text-white hover:text-emerald-200 transition"
                    >
                      <span className="material-icons">close</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Nama Pegawai
                      </div>
                      <div className="text-sm font-bold text-emerald-700">
                        {selectedDetail.nama}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        No KTP
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        {selectedDetail.no_ktp || "-"}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Tanggal
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        {selectedDetail.tanggal} {selectedDetail.bulan}{" "}
                        {selectedDetail.tahun}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Status Presensi
                      </div>
                      <div className="text-sm font-bold text-emerald-700">
                        {selectedDetail.status_presensi || "-"}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Waktu Masuk
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        {selectedDetail.waktu_masuk
                          ? new Date(
                              selectedDetail.waktu_masuk.replace(" ", "T")
                            ).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Waktu Pulang
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        {selectedDetail.waktu_pulang
                          ? new Date(
                              selectedDetail.waktu_pulang.replace(" ", "T")
                            ).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Status Masuk
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        {selectedDetail.status_masuk || "-"}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Status Pulang
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        {selectedDetail.status_pulang || "-"}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 md:col-span-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Keterangan Masuk
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {selectedDetail.keterangan_masuk || "-"}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 md:col-span-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Keterangan Pulang
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {selectedDetail.keterangan_pulang || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedDetail(null);
                      }}
                      className="px-6 py-2 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
                    >
                      <span className="material-icons text-base">close</span>
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
