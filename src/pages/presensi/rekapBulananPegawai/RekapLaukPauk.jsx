import { useEffect, useState } from "react";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchLaukPauk,
  createLaukPauk,
  updateLaukPauk,
  deleteLaukPauk,
} from "../../../redux/actions/laukPaukAction";
import { fetchAllUnit } from "../../../redux/actions/unitDetailAction";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQC...";

export default function RekapLaukPauk() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super_admin";
  const units = useSelector((state) => state.unitDetail.units);
  const token = useSelector((state) => state.auth.token);
  const laukPaukData = useSelector((state) => state.laukPauk.data);

  const [filterUnit, setFilterUnit] = useState("");
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahunLaukPauk, setTahunLaukPauk] = useState(new Date().getFullYear());
  const [rekapLaukPauk, setRekapLaukPauk] = useState([]);
  const [loadingLaukPauk, setLoadingLaukPauk] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
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
    pot_tidak_absen_masuk: "",
    pot_tidak_absen_pulang: "",
    nom_lembur_permenit: "",
    nom_lembur_permenit_weekend: "",
  });

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
      dispatch(fetchLaukPauk(filterUnit, isSuperAdmin));
      dispatch(fetchAllUnit());
    }
  }, [token, dispatch, filterUnit, isSuperAdmin]);

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
      pot_tidak_absen_masuk: parseInt(formData.pot_tidak_absen_masuk),
      pot_tidak_absen_pulang: parseInt(formData.pot_tidak_absen_pulang),
      nom_lembur_permenit: parseInt(formData.nom_lembur_permenit),
      nom_lembur_permenit_weekend: parseInt(
        formData.nom_lembur_permenit_weekend
      ),
    };

    if (editingId) {
      dispatch(updateLaukPauk(editingId, submitData, filterUnit));
    } else {
      dispatch(createLaukPauk(submitData, filterUnit));
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
      pot_tidak_absen_masuk: "",
      pot_tidak_absen_pulang: "",
      nom_lembur_permenit: "",
      nom_lembur_permenit_weekend: "",
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
      pot_tidak_absen_masuk: data.pot_tidak_absen_masuk?.toString() || "",
      pot_tidak_absen_pulang: data.pot_tidak_absen_pulang?.toString() || "",
      nom_lembur_permenit: data.nom_lembur_permenit?.toString() || "",
      nom_lembur_permenit_weekend:
        data.nom_lembur_permenit_weekend?.toString() || "",
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
          "Nominal Lauk Pauk",
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

  return (
    <div className="space-y-6">
      {isSuperAdmin && (
        <div className="bg-white border border-gray-200 shadow-sm p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span className="material-icons text-base text-emerald-600">
              business
            </span>
            Filter Unit Kerja
          </label>
          <select
            className="w-full md:w-auto border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm hover:shadow-md"
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
          >
            <option value="">Semua Unit</option>
            {units.map((unit) => {
              const level = parseInt(unit?.level) || 0;
              const indent = "\u00A0".repeat(level * 4);

              let icon = "";
              if (level === 0) {
                icon = "🏢";
              } else if (level === 1) {
                icon = "📁";
              } else if (level === 2) {
                icon = "📂";
              } else if (level === 3) {
                icon = "📄";
              } else if (level === 4) {
                icon = "📋";
              } else {
                icon = "🧾";
              }

              return (
                <option key={unit.id} value={unit.id}>
                  {indent}
                  {icon} {unit?.nama}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div className="border border-gray-200 bg-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm">
                <span className="material-icons text-white text-2xl">
                  settings
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Setting Lauk Pauk
                </h2>
                <p className="text-sm text-emerald-100 mt-0.5">
                  Konfigurasi nominal dan potongan lauk pauk
                </p>
              </div>
            </div>
            <button
              className="px-5 py-2.5 bg-white text-emerald-600 font-semibold text-sm hover:bg-emerald-50 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
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
                  pot_tidak_absen_masuk: "",
                  pot_tidak_absen_pulang: "",
                  nom_lembur_permenit: "",
                  nom_lembur_permenit_weekend: "",
                });
                setShowForm(true);
              }}
            >
              <span className="material-icons text-base">add</span>
              Tambah Lauk Pauk
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <div className="mb-6">
              {laukPaukData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Nominal
                    </div>
                    <div className="text-lg font-bold text-emerald-600">
                      Rp {laukPaukData.nominal?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Potongan Izin Pribadi
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Rp{" "}
                      {laukPaukData.pot_izin_pribadi?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Potongan Tanpa Izin
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_tanpa_izin?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Potongan Sakit
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Rp {laukPaukData.pot_sakit?.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Potongan Pulang Awal Beralasan
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Rp{" "}
                      {laukPaukData.pot_pulang_awal_beralasan?.toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Potongan Pulang Awal Tanpa Beralasan
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Rp{" "}
                      {laukPaukData.pot_pulang_awal_tanpa_beralasan?.toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Potongan Terlambat 08:06-09:00
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Rp{" "}
                      {laukPaukData.pot_terlambat_0806_0900?.toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Potongan Terlambat 09:01-10:00
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Rp{" "}
                      {laukPaukData.pot_terlambat_0901_1000?.toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Potongan Terlambat Setelah 10:00
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Rp{" "}
                      {laukPaukData.pot_terlambat_setelah_1000?.toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Potongan Tidak Absen Masuk
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Rp{" "}
                      {laukPaukData.pot_tidak_absen_masuk?.toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Potongan Tidak Absen Pulang
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      Rp{" "}
                      {laukPaukData.pot_tidak_absen_pulang?.toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Nominal Lembur Per Menit
                    </div>
                    <div className="text-lg font-bold text-emerald-600">
                      Rp{" "}
                      {laukPaukData.nom_lembur_permenit?.toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      Nominal Lembur Per Menit Weekend
                    </div>
                    <div className="text-lg font-bold text-emerald-600">
                      Rp{" "}
                      {laukPaukData.nom_lembur_permenit_weekend?.toLocaleString(
                        "id-ID"
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 p-4 flex items-center justify-center">
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
                        title="Edit Lauk Pauk"
                        onClick={() => handleEditLaukPauk(laukPaukData)}
                      >
                        <span className="material-icons text-base">edit</span>
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 transition flex items-center gap-2"
                        title="Hapus Lauk Pauk"
                        onClick={() => handleDeleteLaukPauk(laukPaukData.id)}
                      >
                        <span className="material-icons text-base">delete</span>
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                      <span className="material-icons text-gray-400 text-5xl">
                        inbox
                      </span>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-700 mb-1">
                        Belum ada data setting
                      </div>
                      <div className="text-sm text-gray-500">
                        Klik tombol &quot;Tambah Lauk Pauk&quot; untuk membuat
                        setting baru
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showForm && (
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="p-2 bg-emerald-100 ">
                  <span className="material-icons text-emerald-600 text-xl">
                    {editingId ? "edit" : "add"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-700">
                    {editingId ? "Edit Lauk Pauk" : "Tambah Lauk Pauk"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {editingId
                      ? "Ubah konfigurasi lauk pauk"
                      : "Buat konfigurasi lauk pauk baru"}
                  </p>
                </div>
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
                    <p className="text-xs text-gray-500 mt-1">Potongan sakit</p>
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
                  <div className="p-0 border-b border-gray-200">
                    <label
                      htmlFor="pot_tidak_absen_masuk"
                      className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                    >
                      <span className="material-icons text-base text-red-600">
                        money_off
                      </span>
                      Potongan Tidak Absen Masuk (Rp)
                    </label>
                    <input
                      type="number"
                      id="pot_tidak_absen_masuk"
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={formData.pot_tidak_absen_masuk}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pot_tidak_absen_masuk: e.target.value,
                        })
                      }
                      required
                      placeholder="20000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Potongan tidak absen masuk
                    </p>
                  </div>
                  <div className="p-0 border-b border-gray-200">
                    <label
                      htmlFor="pot_tidak_absen_pulang"
                      className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                    >
                      <span className="material-icons text-base text-red-600">
                        money_off
                      </span>
                      Potongan Tidak Absen Pulang (Rp)
                    </label>
                    <input
                      type="number"
                      id="pot_tidak_absen_pulang"
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={formData.pot_tidak_absen_pulang}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pot_tidak_absen_pulang: e.target.value,
                        })
                      }
                      required
                      placeholder="20000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Potongan tidak absen pulang
                    </p>
                  </div>
                  <div className="p-0 border-b border-gray-200">
                    <label
                      htmlFor="nom_lembur_permenit"
                      className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                    >
                      <span className="material-icons text-base text-emerald-600">
                        attach_money
                      </span>
                      Nominal Lembur Per Menit (Rp)
                    </label>
                    <input
                      type="number"
                      id="nom_lembur_permenit"
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={formData.nom_lembur_permenit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nom_lembur_permenit: e.target.value,
                        })
                      }
                      required
                      placeholder="500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nominal lembur per menit
                    </p>
                  </div>
                  <div className="p-0 border-b border-gray-200">
                    <label
                      htmlFor="nom_lembur_permenit_weekend"
                      className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                    >
                      <span className="material-icons text-base text-emerald-600">
                        attach_money
                      </span>
                      Nominal Lembur Per Menit Weekend (Rp)
                    </label>
                    <input
                      type="number"
                      id="nom_lembur_permenit_weekend"
                      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={formData.nom_lembur_permenit_weekend}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nom_lembur_permenit_weekend: e.target.value,
                        })
                      }
                      required
                      placeholder="750"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nominal lembur per menit weekend
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition flex items-center gap-2"
                    onClick={() => setShowForm(false)}
                  >
                    <span className="material-icons text-base">close</span>
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
      </div>

      <div className="border border-gray-200 bg-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm">
              <span className="material-icons text-white text-2xl">
                assessment
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Generate Rekap Lauk Pauk
              </h2>
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
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2  shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={fetchRekapLaukPauk}
                disabled={loadingLaukPauk}
              >
                {loadingLaukPauk ? (
                  <>
                    <span className="material-icons animate-spin text-base">
                      refresh
                    </span>
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
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
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
                  <div className="p-2 bg-emerald-600 ">
                    <span className="material-icons text-white text-lg">
                      description
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">
                      Total Data
                    </div>
                    <div className="text-lg font-bold text-emerald-700">
                      {rekapLaukPauk.length}{" "}
                      {rekapLaukPauk.length === 1 ? "Record" : "Records"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="material-icons text-base">info</span>
                  <span>
                    Klik tombol &quot;Detail&quot; untuk melihat informasi
                    lengkap
                  </span>
                </div>
              </div>
              <div className="w-full overflow-x-auto border border-gray-200 shadow-lg">
                <table className="text-xs whitespace-nowrap w-full">
                  <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white sticky top-0 z-10">
                    <tr>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-12"
                      >
                        NO
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-28"
                      >
                        NIK
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-40"
                      >
                        NAMA PEGAWAI
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-36"
                      >
                        UNIT KERJA
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20"
                      >
                        HARI EFEKTIF
                      </th>
                      <th
                        colSpan="7"
                        className="px-3 py-2 text-center font-bold text-sm border-r border-emerald-500"
                      >
                        STATISTIK PRESENSI
                      </th>
                      <th
                        colSpan="3"
                        className="px-3 py-2 text-center font-bold text-sm border-r border-emerald-500"
                      >
                        DETAIL TERLAMBAT
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20"
                      >
                        PULANG AWAL
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24"
                      >
                        TIDAK ABSEN MASUK
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-24"
                      >
                        TIDAK ABSEN PULANG
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20"
                      >
                        BELUM PRESENSI
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-20"
                      >
                        LIBUR
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-32"
                      >
                        NOMINAL LAUK PAUK
                      </th>
                      <th
                        rowSpan="2"
                        className="px-3 py-3 text-center font-bold text-sm w-20"
                      >
                        DETAIL
                      </th>
                    </tr>
                    <tr>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">
                        HADIR
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">
                        IZIN
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">
                        SAKIT
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">
                        CUTI
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">
                        TIDAK HADIR
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">
                        DINAS
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">
                        TERLAMBAT
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">
                        {"< 09:00"}
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">
                        {"< 10:00"}
                      </th>
                      <th className="px-2 py-2 text-center font-semibold text-xs border-r border-emerald-500">
                        {"> 10:00"}
                      </th>
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
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-semibold">
                              {row.no}
                            </td>
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-mono">
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
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 ">
                                {row.hadir}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-sky-100 text-sky-800 ">
                                {row.izin}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 ">
                                {row.sakit}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 ">
                                {row.cuti}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 ">
                                {row.tidak_hadir}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 ">
                                {row.dinas}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-800 ">
                                {row.terlambat}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              {detailTerlambat.terlambat_sebelum_09_00 || 0}
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              {detailTerlambat.terlambat_sebelum_10_00 || 0}
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              {detailTerlambat.terlambat_setelah_10_00 || 0}
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-pink-100 text-pink-800 ">
                                {row.pulang_awal}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-800 ">
                                {row.tidak_absen_masuk}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-teal-100 text-teal-800 ">
                                {row.tidak_absen_pulang}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-800 ">
                                {row.belum_presensi}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center align-middle text-xs border-r border-gray-200">
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold bg-lime-100 text-lime-800 ">
                                {row.jumlah_libur}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center align-middle text-sm font-bold text-green-600 border-r border-gray-200">
                              Rp{" "}
                              {(row.nominal_lauk_pauk || 0).toLocaleString(
                                "id-ID"
                              )}
                            </td>
                            <td className="px-3 py-3 text-center align-middle">
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedRows);
                                  if (newExpanded.has(idx)) {
                                    newExpanded.delete(idx);
                                  } else {
                                    newExpanded.add(idx);
                                  }
                                  setExpandedRows(newExpanded);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-semibold  transition-all duration-200 flex items-center gap-1.5 mx-auto shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                <span className="material-icons text-sm">
                                  {expandedRows.has(idx)
                                    ? "expand_less"
                                    : "expand_more"}
                                </span>
                                {expandedRows.has(idx) ? "Tutup" : "Detail"}
                              </button>
                            </td>
                          </tr>
                          {expandedRows.has(idx) && (
                            <tr className="bg-gray-50">
                              <td colSpan={14} className="px-0 py-0">
                                <div className="p-6 bg-white border-t-2 border-emerald-200">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Detail Potongan */}
                                    <div className="border-2 border-red-200 bg-white shadow-md">
                                      <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 border-b-2 border-red-800">
                                        <div className="flex items-center gap-2">
                                          <span className="material-icons text-white text-xl">
                                            money_off
                                          </span>
                                          <h4 className="text-base font-bold text-white">
                                            Detail Potongan
                                          </h4>
                                        </div>
                                      </div>
                                      <div className="p-4">
                                        <table className="w-full text-sm">
                                          <thead>
                                            <tr className="bg-red-50 border-b border-red-200">
                                              <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">
                                                Jenis Potongan
                                              </th>
                                              <th className="px-3 py-2 text-right font-semibold text-gray-700 text-xs">
                                                Nominal
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Potongan Terlambat
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-red-700">
                                                Rp{" "}
                                                {(
                                                  detail.potongan_terlambat || 0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Potongan Tidak Absen Masuk
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-red-700">
                                                Rp{" "}
                                                {(
                                                  detail.potongan_tidak_absen_masuk ||
                                                  0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Potongan Tidak Absen Pulang
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-red-700">
                                                Rp{" "}
                                                {(
                                                  detail.potongan_tidak_absen_pulang ||
                                                  0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Potongan Pulang Awal Beralasan
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-red-700">
                                                Rp{" "}
                                                {(
                                                  detail.potongan_pulang_awal_beralasan ||
                                                  0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Potongan Pulang Awal Tanpa
                                                Beralasan
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-red-700">
                                                Rp{" "}
                                                {(
                                                  detail.potongan_pulang_awal_tanpa_beralasan ||
                                                  0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Potongan Izin
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-red-700">
                                                Rp{" "}
                                                {(
                                                  detail.potongan_izin || 0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Potongan Sakit
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-red-700">
                                                Rp{" "}
                                                {(
                                                  detail.potongan_sakit || 0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Potongan Tanpa Izin
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-red-700">
                                                Rp{" "}
                                                {(
                                                  detail.potongan_tanpa_izin ||
                                                  0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Potongan Belum Presensi
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-red-700">
                                                Rp{" "}
                                                {(
                                                  detail.potongan_belum_presensi ||
                                                  0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-red-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Potongan Dinas
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-red-700">
                                                Rp{" "}
                                                {(
                                                  detail.potongan_dinas || 0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                          </tbody>
                                          <tfoot>
                                            <tr className="bg-red-100 border-t-2 border-red-300">
                                              <td className="px-3 py-3 text-left font-bold text-gray-800">
                                                Total Potongan
                                              </td>
                                              <td className="px-3 py-3 text-right font-bold text-lg text-red-700">
                                                Rp{" "}
                                                {(
                                                  (detail.potongan_terlambat ||
                                                    0) +
                                                  (detail.potongan_tidak_absen_masuk ||
                                                    0) +
                                                  (detail.potongan_tidak_absen_pulang ||
                                                    0) +
                                                  (detail.potongan_pulang_awal_beralasan ||
                                                    0) +
                                                  (detail.potongan_pulang_awal_tanpa_beralasan ||
                                                    0) +
                                                  (detail.potongan_izin || 0) +
                                                  (detail.potongan_sakit || 0) +
                                                  (detail.potongan_tanpa_izin ||
                                                    0) +
                                                  (detail.potongan_belum_presensi ||
                                                    0) +
                                                  (detail.potongan_dinas || 0)
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                          </tfoot>
                                        </table>
                                      </div>
                                    </div>

                                    {/* Detail Lembur */}
                                    <div className="border-2 border-emerald-200 bg-white shadow-md">
                                      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-3 border-b-2 border-emerald-800">
                                        <div className="flex items-center gap-2">
                                          <span className="material-icons text-white text-xl">
                                            attach_money
                                          </span>
                                          <h4 className="text-base font-bold text-white">
                                            Detail Lembur
                                          </h4>
                                        </div>
                                      </div>
                                      <div className="p-4">
                                        <table className="w-full text-sm">
                                          <thead>
                                            <tr className="bg-emerald-50 border-b border-emerald-200">
                                              <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">
                                                Jenis Lembur
                                              </th>
                                              <th className="px-3 py-2 text-right font-semibold text-gray-700 text-xs">
                                                Nominal
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr className="border-b border-gray-100 hover:bg-emerald-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Lembur Weekday
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-emerald-700">
                                                Rp{" "}
                                                {(
                                                  detail.lembur_weekday || 0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                            <tr className="border-b border-gray-100 hover:bg-emerald-50 transition">
                                              <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                Lembur Weekend
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-emerald-700">
                                                Rp{" "}
                                                {(
                                                  detail.lembur_weekend || 0
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                          </tbody>
                                          <tfoot>
                                            <tr className="bg-emerald-100 border-t-2 border-emerald-300">
                                              <td className="px-3 py-3 text-left font-bold text-gray-800">
                                                Total Lembur
                                              </td>
                                              <td className="px-3 py-3 text-right font-bold text-lg text-emerald-700">
                                                Rp{" "}
                                                {(
                                                  (detail.lembur_weekday || 0) +
                                                  (detail.lembur_weekend || 0)
                                                ).toLocaleString("id-ID")}
                                              </td>
                                            </tr>
                                          </tfoot>
                                        </table>
                                      </div>
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
