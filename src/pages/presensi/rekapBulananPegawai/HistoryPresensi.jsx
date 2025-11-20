import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPresensiHistoryByUnit } from "../../../redux/actions/presensiAction";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC...";

export default function HistoryPresensi() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.presensi.data);
  const loading = useSelector((state) => state.presensi.loading);
  const user = useSelector((state) => state.auth.user);
  const today = new Date();
  const defaultFrom = today.toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(defaultFrom);

  useEffect(() => {
    if (user !== null) {
      dispatch(fetchPresensiHistoryByUnit(fromDate));
    }
  }, [dispatch, user, fromDate]);

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

  return (
    <>
      {loading ? (
        <div className="text-center py-12 text-primary/70 font-bold flex items-center justify-center gap-2">
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
                    Total Data: {data.length} records
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700">
                  <label className="font-semibold">Dari:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[200%] text-xs border-2 border-emerald-200 overflow-hidden shadow-lg">
              <thead className="sticky top-0 z-10 bg-emerald-50 border-b-2 border-emerald-200">
                <tr>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-12">
                    <span className="material-icons text-base">
                      format_list_numbered
                    </span>
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-32">
                    No KTP
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-56">
                    Nama
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-32">
                    Status Masuk
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-32">
                    Status Pulang
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-32">
                    Status Presensi
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-40">
                    Waktu Masuk
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-40">
                    Waktu Pulang
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-40">
                    Keterangan Masuk
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider w-40">
                    Keterangan Pulang
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                        idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                      }`}
                    >
                      <td className="px-3 py-2 text-center align-middle font-semibold border-r border-emerald-100">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 align-middle border-r border-emerald-100">
                        {row.no_ktp}
                      </td>
                      <td className="px-3 py-2 align-middle font-bold text-emerald-800 border-r border-emerald-100">
                        {row.nama}
                      </td>
                      <td className="px-3 py-2 align-middle font-bold text-emerald-800 border-r border-emerald-100">
                        {row.status_masuk}
                      </td>
                      <td className="px-3 py-2 align-middle font-bold text-emerald-800 border-r border-emerald-100">
                        {row.status_pulang}
                      </td>
                      <td className="px-3 py-2 align-middle font-bold text-emerald-800 border-r border-emerald-100">
                        {row.status_presensi}
                      </td>
                      <td className="px-3 py-2 align-middle border-r border-emerald-100">
                        {row.waktu_masuk
                          ? new Date(row.waktu_masuk).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-3 py-2 align-middle border-r border-emerald-100">
                        {row.waktu_pulang
                          ? new Date(row.waktu_pulang).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-3 py-2 align-middle border-r border-emerald-100">
                        {row.keterangan_masuk || "-"}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        {row.keterangan_pulang || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-400 py-8">
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
      )}
    </>
  );
}
