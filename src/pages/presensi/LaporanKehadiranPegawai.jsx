import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLaporanKehadiranPegawai } from "../../redux/actions/presensiAction";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC...";

export default function LaporanKehadiranPegawai() {
  const dispatch = useDispatch();
  const { pegawai_id } = useParams();
  const navigate = useNavigate();
  const data = useSelector((state) => state.presensi.laporanKehadiran);
  const loading = useSelector(
    (state) => state.presensi.laporanKehadiranLoading
  );
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

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
    if (pegawai_id) {
      dispatch(fetchLaporanKehadiranPegawai(pegawai_id, bulan, tahun));
    }
  }, [dispatch, pegawai_id, bulan, tahun]);

  const handleDownloadPDF = () => {
    if (!data) return;

    const doc = new jsPDF("l", "mm", "a4");

    try {
      doc.addImage(logoBase64, "PNG", 10, 10, 25, 25);
    } catch {
      void 0;
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

    doc.setFontSize(12);
    doc.text("LAPORAN KEHADIRAN PEGAWAI", 148, 55, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Nama: ${data.pegawai.nama}`, 20, 65);
    doc.text(`NIK: ${data.pegawai.no_ktp}`, 20, 72);
    doc.text(`Unit Kerja: ${data.pegawai.unit_kerja || "-"}`, 20, 79);
    doc.text(`Jabatan: ${data.pegawai.jabatan || "-"}`, 20, 86);
    doc.text(
      `Periode: ${
        bulanOptions.find((b) => b.value === parseInt(data.periode.bulan))
          ?.label
      } ${data.periode.tahun}`,
      20,
      93
    );

    autoTable(doc, {
      startY: 100,
      head: [
        [
          "TGL. ABSENSI",
          "JAM KERJA (MASUK)",
          "JAM KERJA (PULANG)",
          "JAM MASUK",
          "JAM KELUAR",
          "JML MENIT DATANG (CEPAT)",
          "JML MENIT DATANG (TELAT)",
          "JML MENIT PULANG (CEPAT)",
          "JML MENIT PULANG (LEMBUR)",
          "JML JAM KERJA",
          "ALASAN",
        ],
      ],
      body: data.data.map((row) => [
        row.tgl_absensi,
        row.jam_kerja.masuk,
        row.jam_kerja.pulang,
        row.jam_masuk,
        row.jam_keluar,
        row.jumlah_menit_datang.menit_datang_cepat > 0
          ? `${row.jumlah_menit_datang.menit_datang_cepat}`
          : "-",
        row.jumlah_menit_datang.menit_telat > 0
          ? `${row.jumlah_menit_datang.menit_telat}`
          : "-",
        row.jumlah_menit_pulang.menit_pulang_cepat > 0
          ? `${row.jumlah_menit_pulang.menit_pulang_cepat}`
          : "-",
        row.jumlah_menit_pulang.menit_lembur > 0
          ? `${row.jumlah_menit_pulang.menit_lembur}`
          : "-",
        row.jam_kerja_total,
        row.alasan || "-",
      ]),
      headStyles: {
        fillColor: [64, 64, 64],
        halign: "center",
        fontStyle: "bold",
        fontSize: 8,
        textColor: [255, 255, 255],
      },
      bodyStyles: {
        fontSize: 7,
        halign: "center",
        textColor: [0, 0, 0],
      },
      styles: {
        cellPadding: 2,
        font: "helvetica",
        lineWidth: 0.1,
      },
      margin: { left: 10, right: 10 },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: 30, halign: "center" },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 25, halign: "center" },
        4: { cellWidth: 25, halign: "center" },
        5: { cellWidth: 22, halign: "center" },
        6: { cellWidth: 22, halign: "center" },
        7: { cellWidth: 22, halign: "center" },
        8: { cellWidth: 22, halign: "center" },
        9: { cellWidth: 25, halign: "center" },
        10: { cellWidth: 35, halign: "left" },
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: function (data) {
        doc.setFontSize(8);
        doc.text(
          `Halaman ${doc.internal.getNumberOfPages()}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    doc.save(
      `laporan-kehadiran-${data.pegawai.nama}-${
        bulanOptions.find((b) => b.value === bulan)?.label
      }-${tahun}.pdf`
    );
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center"
        >
          <span className="material-icons text-gray-600">arrow_back</span>
        </button>
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white">assessment</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Laporan Kehadiran Pegawai
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Detail laporan kehadiran pegawai per periode
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-7xl flex flex-col gap-6">
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-emerald-600">
                  summarize
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Filter & Data Laporan
                </h3>
                <p className="text-emerald-100 text-xs font-medium">
                  Pilih periode lalu tampilkan atau unduh laporan
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="material-icons text-sm">calendar_month</span>
                  Bulan
                </label>
                <select
                  className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
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
                <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="material-icons text-sm">event</span>
                  Tahun
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                  value={tahun}
                  onChange={(e) => setTahun(Number(e.target.value))}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs border-2 border-emerald-700 hover:bg-emerald-700 transition flex items-center gap-2"
                  onClick={() =>
                    dispatch(
                      fetchLaporanKehadiranPegawai(pegawai_id, bulan, tahun)
                    )
                  }
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
                      <span className="material-icons text-sm">search</span>
                      Cari Data
                    </>
                  )}
                </button>
                {data && data.data.length > 0 && (
                  <button
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs border-2 border-blue-700 hover:bg-blue-700 transition flex items-center gap-2"
                    onClick={handleDownloadPDF}
                  >
                    <span className="material-icons text-sm">download</span>
                    Download PDF
                  </button>
                )}
              </div>
            </div>

            {data && (
              <div className="bg-emerald-50 border-2 border-emerald-200 p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Nama Pegawai
                    </div>
                    <div className="font-black text-emerald-800">
                      {data.pegawai.nama}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">NIK</div>
                    <div className="font-semibold text-gray-900">
                      {data.pegawai.no_ktp}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Unit Kerja</div>
                    <div className="font-semibold text-gray-900">
                      {data.pegawai.unit_kerja || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Jabatan</div>
                    <div className="font-semibold text-gray-900">
                      {data.pegawai.jabatan || "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-emerald-600 font-bold flex items-center justify-center gap-2">
                <span className="material-icons animate-spin">refresh</span>
                Memuat data laporan kehadiran...
              </div>
            ) : !data ? (
              <div className="text-center text-gray-400 py-8">
                <div className="flex flex-col items-center gap-2">
                  <span className="material-icons text-4xl text-gray-300">
                    search
                  </span>
                  <span className="font-semibold">
                    Pilih periode untuk melihat data
                  </span>
                  <span className="text-sm">
                    Klik tombol &quot;Cari Data&quot; untuk menampilkan laporan
                    kehadiran
                  </span>
                </div>
              </div>
            ) : data && data.data.length > 0 ? (
              <>
                <div className="mb-3 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span className="material-icons">description</span>
                    <span className="font-semibold">
                      Total Data: {data.data.length} records
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto border-2 border-emerald-200 shadow-lg">
                  <table className="min-w-[150%] text-xs bg-white">
                    <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                      <tr>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-32">
                          TGL. ABSENSI
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-20">
                          JAM KERJA (MASUK)
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-20">
                          JAM KERJA (PULANG)
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-24">
                          JAM MASUK
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-24">
                          JAM KELUAR
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-24">
                          JML MENIT DATANG (CEPAT)
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-24">
                          JML MENIT DATANG (TELAT)
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-24">
                          JML MENIT PULANG (CEPAT)
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-24">
                          JML MENIT PULANG (LEMBUR)
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider border-r border-emerald-200 w-28">
                          JML JAM KERJA
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 uppercase tracking-wider w-32">
                          ALASAN
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                            idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                          }`}
                        >
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            {row.tgl_absensi}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            {row.jam_kerja.masuk}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            {row.jam_kerja.pulang}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            {row.jam_masuk}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            {row.jam_keluar}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            {row.jumlah_menit_datang.menit_datang_cepat > 0 ? (
                              <span className="text-emerald-600 font-semibold">
                                {row.jumlah_menit_datang.menit_datang_cepat}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            {row.jumlah_menit_datang.menit_telat > 0 ? (
                              <span className="text-red-600 font-semibold">
                                {row.jumlah_menit_datang.menit_telat}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            {row.jumlah_menit_pulang.menit_pulang_cepat > 0 ? (
                              <span className="text-orange-600 font-semibold">
                                {row.jumlah_menit_pulang.menit_pulang_cepat}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm border-r border-emerald-100">
                            {row.jumlah_menit_pulang.menit_lembur > 0 ? (
                              <span className="text-green-600 font-semibold">
                                {row.jumlah_menit_pulang.menit_lembur}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center align-middle font-bold text-emerald-800 text-sm border-r border-emerald-100">
                            {row.jam_kerja_total}
                          </td>
                          <td className="px-3 py-2 text-center align-middle text-sm">
                            {row.alasan || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : data && data.data.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="flex flex-col items-center gap-2">
                  <span className="material-icons text-4xl text-gray-300">
                    inbox
                  </span>
                  <span className="font-semibold">
                    Tidak ada data ditemukan
                  </span>
                  <span className="text-sm">
                    Data laporan kehadiran kosong untuk periode ini
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
