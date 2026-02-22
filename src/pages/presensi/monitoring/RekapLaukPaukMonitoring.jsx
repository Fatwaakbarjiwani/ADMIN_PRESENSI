import { useEffect, useState } from "react";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchLaukPauk } from "../../../redux/actions/laukPaukAction";
import { fetchMonitoringUnits } from "../../../redux/actions/adminMonitoringAction";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC...";

export default function RekapLaukPaukMonitoring() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const laukPaukData = useSelector((state) => state.laukPauk.data);
  const [unitId, setUnitId] = useState("");
  const [monitoringUnits, setMonitoringUnits] = useState([]);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahunLaukPauk, setTahunLaukPauk] = useState(new Date().getFullYear());
  const [rekapLaukPauk, setRekapLaukPauk] = useState([]);
  const [loadingLaukPauk, setLoadingLaukPauk] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

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
      dispatch(fetchLaukPauk("", false, unitId));
    }
  }, [token, dispatch, unitId]);

  const fetchRekapLaukPauk = async () => {
    if (!unitId) return;
    setLoadingLaukPauk(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/presensi/rekap-bulanan-semua-pegawai?unit_id=${unitId}&bulan=${bulan}&tahun=${tahunLaukPauk}`,
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

  const handleDownloadLaukPaukPDF = () => {
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
      "Email : informasi@nama.ac.id Homepage : http://ybwsa.ac.id",
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
          "NIK",
          "Nama Pegawai",
          "Unit Kerja",
          "Hari Efektif",
          "Hadir",
          "Izin",
          "Sakit",
          "Cuti",
          "Tidak Hadir",
          "Dinas",
          "Terlambat",
          "< 09:00",
          "< 10:00",
          "> 10:00",
          "Pulang Awal",
          "Tidak Absen Masuk",
          "Tidak Absen Pulang",
          "Belum Presensi",
          "Jumlah Libur",
          "Nominal Transport",
        ],
      ],
      body: rekapLaukPauk.map((row) => {
        const detailTerlambat = row.detail_terlambat || {};
        return [
          row.no,
          row.nik,
          row.nama_pegawai,
          row.unit_kerja,
          row.hari_efektif,
          row.hadir,
          row.izin,
          row.sakit,
          row.cuti,
          row.tidak_hadir,
          row.dinas,
          row.terlambat,
          detailTerlambat.terlambat_sebelum_09_00 || 0,
          detailTerlambat.terlambat_sebelum_10_00 || 0,
          detailTerlambat.terlambat_setelah_10_00 || 0,
          row.pulang_awal,
          row.tidak_absen_masuk,
          row.tidak_absen_pulang,
          row.belum_presensi,
          row.jumlah_libur,
          (row.nominal_lauk_pauk || 0).toLocaleString("id-ID"),
        ];
      }),
      headStyles: {
        fillColor: [22, 160, 133],
        halign: "center",
        fontStyle: "bold",
        fontSize: 7,
      },
      bodyStyles: { fontSize: 6 },
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

  if (!unitId) {
    return (
      <div className="bg-white border-2 border-emerald-200 shadow-lg">
        <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2">
              <span className="material-icons text-lg text-emerald-600">restaurant</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">Rekap Lauk Pauk</h3>
              <p className="text-white/80 text-xs font-medium">Pilih unit untuk melihat data rekap lauk pauk</p>
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
      <div className="border border-gray-200 bg-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm">
                <span className="material-icons text-white text-2xl">settings</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Setting Lauk Pauk</h2>
                <p className="text-sm text-emerald-100 mt-0.5">
                  Konfigurasi nominal dan potongan lauk pauk (read-only)
                </p>
              </div>
            </div>
            <select
              className="px-4 py-2.5 border border-gray-300 rounded bg-white text-gray-700 font-medium text-sm"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            >
              {monitoringUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama || u.name || `Unit ${u.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <div className="mb-6">
              {laukPaukData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Nominal</div>
                    <div className="text-lg font-bold text-emerald-600">
                      Rp {laukPaukData.nominal?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Potongan Izin Pribadi</div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_izin_pribadi?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Potongan Tanpa Izin</div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_tanpa_izin?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Potongan Sakit</div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_sakit?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Potongan Pulang Awal Beralasan</div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_pulang_awal_beralasan?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Potongan Pulang Awal Tanpa Beralasan</div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_pulang_awal_tanpa_beralasan?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Potongan Terlambat 08:06-09:00</div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_terlambat_0806_0900?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Potongan Terlambat 09:01-10:00</div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_terlambat_0901_1000?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Potongan Terlambat Setelah 10:00</div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_terlambat_setelah_1000?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Potongan Tidak Absen Masuk</div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_tidak_absen_masuk?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Potongan Tidak Absen Pulang</div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_tidak_absen_pulang?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Nominal Lembur Per Menit</div>
                    <div className="text-lg font-bold text-emerald-600">
                      Rp {laukPaukData.nom_lembur_permenit?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Nominal Lembur Per Menit Weekend</div>
                    <div className="text-lg font-bold text-emerald-600">
                      Rp {laukPaukData.nom_lembur_permenit_weekend?.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                      <span className="material-icons text-gray-400 text-5xl">inbox</span>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-700 mb-1">Belum ada data setting</div>
                      <div className="text-sm text-gray-500">
                        Data setting lauk pauk untuk unit ini belum tersedia
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 bg-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm">
              <span className="material-icons text-white text-2xl">assessment</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Generate Rekap Lauk Pauk</h2>
              <p className="text-sm text-emerald-100 mt-0.5">
                Generate dan download laporan rekap lauk pauk bulanan
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="flex-1">
              <label className="flex text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                <span className="material-icons text-base">calendar_month</span>
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
            <div className="flex gap-3">
              <button
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={fetchRekapLaukPauk}
                disabled={loadingLaukPauk}
              >
                {loadingLaukPauk ? (
                  <>
                    <span className="material-icons animate-spin text-base">refresh</span>
                    Loading...
                  </>
                ) : (
                  <>
                    <span className="material-icons text-base">play_arrow</span>
                    Generate Data
                  </>
                )}
              </button>
              {rekapLaukPauk.length > 0 && (
                <button
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition flex items-center gap-2"
                  onClick={handleDownloadLaukPaukPDF}
                >
                  <span className="material-icons text-base">download</span>
                  Download PDF
                </button>
              )}
            </div>
          </div>

          {rekapLaukPauk.length > 0 && (
            <>
              <div className="mb-4 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600">
                    <span className="material-icons text-white text-lg">description</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Total Data</div>
                    <div className="text-lg font-bold text-emerald-700">
                      {rekapLaukPauk.length} {rekapLaukPauk.length === 1 ? "Record" : "Records"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="material-icons text-base">info</span>
                  <span>Klik tombol &quot;Detail&quot; untuk melihat informasi lengkap</span>
                </div>
              </div>
              <div className="w-full overflow-x-auto border border-gray-200 shadow-lg">
                <table className="text-xs whitespace-nowrap w-full">
                  <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white sticky top-0 z-10">
                    <tr>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-12">NO</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-28">NIK</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-40">NAMA PEGAWAI</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-36">UNIT KERJA</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">HARI EFEKTIF</th>
                      <th colSpan="7" className="px-3 py-2 text-center font-bold text-sm border-r border-emerald-500">STATISTIK PRESENSI</th>
                      <th colSpan="3" className="px-3 py-2 text-center font-bold text-sm border-r border-emerald-500">DETAIL TERLAMBAT</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">PULANG AWAL</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24">TIDAK ABSEN MASUK</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24">TIDAK ABSEN PULANG</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">BELUM PRESENSI</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20">LIBUR</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-32">NOMINAL LAUK PAUK</th>
                      <th rowSpan="2" className="px-3 py-3 text-center font-bold text-sm w-20">DETAIL</th>
                    </tr>
                    <tr>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">HADIR</th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">IZIN</th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">SAKIT</th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">CUTI</th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">TIDAK HADIR</th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">DINAS</th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">TERLAMBAT</th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">{"< 09:00"}</th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">{"< 10:00"}</th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">{"> 10:00"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapLaukPauk.map((row, idx) => {
                      const detail = row.detail_potongan_dan_lembur || {};
                      const detailTerlambat = row.detail_terlambat || {};
                      return (
                        <React.Fragment key={idx}>
                          <tr
                            className={`transition hover:bg-emerald-50 border-b border-gray-100 ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-semibold">{row.no}</td>
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-mono">{row.nik}</td>
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-semibold">{row.nama_pegawai}</td>
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">{row.unit_kerja}</td>
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-semibold">{row.hari_efektif}</td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800">{row.hadir}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-sky-100 text-sky-800">{row.izin}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">{row.sakit}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">{row.cuti}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">{row.tidak_hadir}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800">{row.dinas}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800">{row.terlambat}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">{detailTerlambat.terlambat_sebelum_09_00 || 0}</td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">{detailTerlambat.terlambat_sebelum_10_00 || 0}</td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">{detailTerlambat.terlambat_setelah_10_00 || 0}</td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-pink-100 text-pink-800">{row.pulang_awal}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800">{row.tidak_absen_masuk}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-teal-100 text-teal-800">{row.tidak_absen_pulang}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-800">{row.belum_presensi}</span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-lime-100 text-lime-800">{row.jumlah_libur}</span>
                            </td>
                            <td className="px-3 py-3 text-center align-middle text-sm font-bold text-green-600 border-r border-gray-200">
                              Rp {(row.nominal_lauk_pauk || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="px-3 py-3 text-center align-middle">
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedRows);
                                  if (newExpanded.has(idx)) newExpanded.delete(idx);
                                  else newExpanded.add(idx);
                                  setExpandedRows(newExpanded);
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 mx-auto"
                              >
                                <span className="material-icons text-sm">
                                  {expandedRows.has(idx) ? "expand_less" : "expand_more"}
                                </span>
                                {expandedRows.has(idx) ? "Tutup" : "Detail"}
                              </button>
                            </td>
                          </tr>
                          {expandedRows.has(idx) && (
                            <tr className="bg-gray-50">
                              <td colSpan={14} className="px-0 py-0">
                                <div className="p-6 bg-white border-t-2 border-emerald-200 flex justify-center">
                                  <div className="border-2 border-red-200 bg-white shadow-md max-w-2xl w-full">
                                    <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 border-b-2 border-red-800">
                                      <div className="flex items-center gap-2">
                                        <span className="material-icons text-white text-xl">money_off</span>
                                        <h4 className="text-base font-bold text-white">Detail Potongan</h4>
                                      </div>
                                    </div>
                                    <div className="p-4">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="bg-red-50 border-b border-red-200">
                                            <th className="px-4 py-2.5 text-left font-semibold text-gray-700 text-xs w-3/5">Jenis Potongan</th>
                                            <th className="px-4 py-2.5 text-right font-semibold text-gray-700 text-xs w-2/5">Nominal</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                            <td className="px-4 py-2 text-gray-700 font-medium">Potongan Terlambat</td>
                                            <td className="px-4 py-2 text-right font-bold text-red-700 whitespace-nowrap">
                                              Rp {(detail.potongan_terlambat || 0).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                          <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                            <td className="px-4 py-2 text-gray-700 font-medium">Potongan Tidak Absen Masuk</td>
                                            <td className="px-4 py-2 text-right font-bold text-red-700 whitespace-nowrap">
                                              Rp {(detail.potongan_tidak_absen_masuk || 0).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                          <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                            <td className="px-4 py-2 text-gray-700 font-medium">Potongan Tidak Absen Pulang</td>
                                            <td className="px-4 py-2 text-right font-bold text-red-700 whitespace-nowrap">
                                              Rp {(detail.potongan_tidak_absen_pulang || 0).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                          <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                            <td className="px-4 py-2 text-gray-700 font-medium">Potongan Pulang Awal Beralasan</td>
                                            <td className="px-4 py-2 text-right font-bold text-red-700 whitespace-nowrap">
                                              Rp {(detail.potongan_pulang_awal_beralasan || 0).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                          <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                            <td className="px-4 py-2 text-gray-700 font-medium">Potongan Pulang Awal Tanpa Beralasan</td>
                                            <td className="px-4 py-2 text-right font-bold text-red-700 whitespace-nowrap">
                                              Rp {(detail.potongan_pulang_awal_tanpa_beralasan || 0).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                          <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                            <td className="px-4 py-2 text-gray-700 font-medium">Potongan Izin</td>
                                            <td className="px-4 py-2 text-right font-bold text-red-700 whitespace-nowrap">
                                              Rp {(detail.potongan_izin || 0).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                          <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                            <td className="px-4 py-2 text-gray-700 font-medium">Potongan Sakit</td>
                                            <td className="px-4 py-2 text-right font-bold text-red-700 whitespace-nowrap">
                                              Rp {(detail.potongan_sakit || 0).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                          <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                            <td className="px-4 py-2 text-gray-700 font-medium">Potongan Tanpa Izin</td>
                                            <td className="px-4 py-2 text-right font-bold text-red-700 whitespace-nowrap">
                                              Rp {(detail.potongan_tanpa_izin || 0).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                          <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                            <td className="px-4 py-2 text-gray-700 font-medium">Potongan Belum Presensi</td>
                                            <td className="px-4 py-2 text-right font-bold text-red-700 whitespace-nowrap">
                                              Rp {(detail.potongan_belum_presensi || 0).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                          <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                            <td className="px-4 py-2 text-gray-700 font-medium">Potongan Dinas</td>
                                            <td className="px-4 py-2 text-right font-bold text-red-700 whitespace-nowrap">
                                              Rp {(detail.potongan_dinas || 0).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                        </tbody>
                                        <tfoot>
                                          <tr className="bg-red-100 border-t-2 border-red-300">
                                            <td className="px-4 py-2.5 text-left font-bold text-gray-800">Total Potongan</td>
                                            <td className="px-4 py-2.5 text-right font-bold text-lg text-red-700 whitespace-nowrap">
                                              Rp{" "}
                                              {(
                                                (detail.potongan_terlambat || 0) +
                                                (detail.potongan_tidak_absen_masuk || 0) +
                                                (detail.potongan_tidak_absen_pulang || 0) +
                                                (detail.potongan_pulang_awal_beralasan || 0) +
                                                (detail.potongan_pulang_awal_tanpa_beralasan || 0) +
                                                (detail.potongan_izin || 0) +
                                                (detail.potongan_sakit || 0) +
                                                (detail.potongan_tanpa_izin || 0) +
                                                (detail.potongan_belum_presensi || 0) +
                                                (detail.potongan_dinas || 0)
                                              ).toLocaleString("id-ID")}
                                            </td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
