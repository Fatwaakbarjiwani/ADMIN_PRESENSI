import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../redux/actions/dashboardAction";

function CollapsibleSection({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border-2 border-emerald-200 shadow-lg">
      <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2">
              <span className="material-icons text-lg text-emerald-600">
                {icon}
              </span>
            </div>
            <div>
              <div className="text-lg font-black text-white uppercase tracking-wide">
                {title}
              </div>
            </div>
          </div>
          <button
            className="text-white hover:text-emerald-100 focus:outline-none transition-colors"
            onClick={() => setOpen((v) => !v)}
            title={open ? "Tutup" : "Buka"}
          >
            <span className="material-icons text-xl">
              {open ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>
      </div>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

CollapsibleSection.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
};

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function Home() {
  const dispatch = useDispatch();
  const dashboard = useSelector((state) => state.dashboard.data);
  const loading = useSelector((state) => state.dashboard.loading);

  // Gunakan Date bawaan JS
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1); // getMonth() 0-based
  const [tahun, setTahun] = useState(now.getFullYear());
  const [showHeaderInfo, setShowHeaderInfo] = useState(true);

  // Fetch dashboard berdasarkan bulan & tahun
  useEffect(() => {
    dispatch(fetchDashboard(bulan, tahun));
  }, [dispatch, bulan, tahun]);

  // Summary Data
  const summaryData = dashboard
    ? [
        {
          label: "Total Pegawai",
          value: dashboard.ringkasan?.total_pegawai,
          color: "#fbbf24",
          icon: "groups",
        },
        {
          label: "Hari Efektif",
          value: dashboard.ringkasan?.ringkasan_presensi?.hari_efektif_berjalan,
          color: "#6366f1",
          icon: "calendar_today",
          showPercent: false,
        },
        {
          label: "Attendance Rate",
          value:
            dashboard.ringkasan?.ringkasan_presensi?.attendance_rate !==
            undefined
              ? `${dashboard.ringkasan.ringkasan_presensi.attendance_rate.toFixed(
                  2
                )}%`
              : "-",
          color: "#059669",
          icon: "percent",
          showPercent: false,
        },
        {
          label: "Hadir",
          value: dashboard.ringkasan?.ringkasan_presensi?.hadir,
          color: "#2563eb",
          icon: "check_circle",
          showPercent: true,
        },
        {
          label: "Terlambat",
          value: dashboard.ringkasan?.ringkasan_presensi?.terlambat,
          color: "#f59e42",
          icon: "schedule",
          showPercent: true,
        },
        {
          label: "Tidak Hadir",
          value: dashboard.ringkasan?.ringkasan_presensi?.tidak_hadir,
          color: "#f87171",
          icon: "block",
          showPercent: true,
        },
        {
          label: "Lembur",
          value: dashboard.ringkasan?.ringkasan_presensi?.lembur,
          color: "#8b5cf6",
          icon: "work",
          showPercent: true,
        },
        {
          label: "Tidak Absen Masuk",
          value: dashboard.ringkasan?.ringkasan_presensi?.tidak_absen_masuk,
          color: "#f97316",
          icon: "login",
          showPercent: true,
        },
        {
          label: "Pulang Awal",
          value: dashboard.ringkasan?.ringkasan_presensi?.pulang_awal,
          color: "#ef4444",
          icon: "logout",
          showPercent: true,
        },
        {
          label: "Izin",
          value: dashboard.ringkasan?.ringkasan_presensi?.izin,
          color: "#fbbf24",
          icon: "event_busy",
          showPercent: true,
        },
        {
          label: "Sakit",
          value: dashboard.ringkasan?.ringkasan_presensi?.sakit,
          color: "#3b82f6",
          icon: "healing",
          showPercent: true,
        },
        {
          label: "Cuti",
          value: dashboard.ringkasan?.ringkasan_presensi?.cuti,
          color: "#a78bfa",
          icon: "beach_access",
          showPercent: true,
        },
        {
          label: "Dinas",
          value: dashboard.ringkasan?.ringkasan_presensi?.dinas,
          color: "#10b981",
          icon: "business",
          showPercent: true,
        },
        {
          label: "Total Expected",
          value: dashboard.ringkasan?.ringkasan_presensi?.total_expected,
          color: "#059669",
          icon: "assessment",
          showPercent: false,
        },
      ]
    : [];

  // Total summary dari total_pegawai (100%)
  const totalSummary =
    dashboard?.ringkasan?.ringkasan_presensi?.total_expected || 0;

  // Pie Presensi User
  const userPresensiData = dashboard
    ? [
        {
          name: "Hadir",
          value: dashboard.ringkasan.ringkasan_presensi.hadir,
          color: "#2563eb",
        },
        {
          name: "Terlambat",
          value: dashboard.ringkasan.ringkasan_presensi.terlambat,
          color: "#f59e42",
        },
        {
          name: "Tidak Hadir",
          value: dashboard.ringkasan.ringkasan_presensi.tidak_hadir,
          color: "#f87171",
        },
        {
          name: "Lembur",
          value: dashboard.ringkasan.ringkasan_presensi.lembur,
          color: "#8b5cf6",
        },
        {
          name: "Tidak Absen Masuk",
          value: dashboard.ringkasan.ringkasan_presensi.tidak_absen_masuk,
          color: "#f97316",
        },
        {
          name: "Pulang Awal",
          value: dashboard.ringkasan.ringkasan_presensi.pulang_awal,
          color: "#ef4444",
        },
        {
          name: "Izin",
          value: dashboard?.ringkasan?.ringkasan_presensi?.izin,
          color: "#fbbf24",
        },
        {
          name: "Sakit",
          value: dashboard?.ringkasan?.ringkasan_presensi?.sakit,
          color: "#3b82f6",
        },
        {
          name: "Cuti",
          value: dashboard?.ringkasan?.ringkasan_presensi?.cuti,
          color: "#a78bfa",
        },
        {
          name: "Dinas",
          value: dashboard?.ringkasan?.ringkasan_presensi?.dinas,
          color: "#10b981",
        },
      ].filter((item) => item.value > 0) // Hanya tampilkan yang ada nilainya
    : [];

  // Data bulanan
  const dataBulanan = dashboard?.charts?.data_bulanan || [];

  // Data harian
  const dataHarian = dashboard?.charts?.jumlah_data_presensi_harian || [];

  // Data aktivitas
  const aktivitas = dashboard?.aktifitas?.recent_activities || [];

  // Sisa pengajuan
  const sisaPengajuan = dashboard?.ringkasan?.sisa_pengajuan || {};

  // Loading Component - Tampil penuh saat proses loading
  if (loading) {
    return (
      <div className="w-full min-h-screen font-sans bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 p-8">
          {/* Animated Logo/Icon */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-24 h-24 border-4 border-emerald-100 rounded-full absolute animate-spin"></div>
            <div
              className="w-24 h-24 border-4 border-transparent border-t-emerald-600 border-r-emerald-500 rounded-full animate-spin"
              style={{ animationDuration: "1s" }}
            ></div>
            {/* Inner pulsing circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <span className="material-icons text-white text-3xl">
                  dashboard
                </span>
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-center space-y-2">
            <div className="text-emerald-700 font-black text-2xl tracking-tight uppercase">
              Memuat Dashboard
            </div>
            <div className="text-emerald-600 text-sm font-medium">
              Mohon tunggu, sedang mengambil data...
            </div>
          </div>

          {/* Loading Dots Animation */}
          <div className="flex gap-2">
            <div
              className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>

          {/* Progress Bar */}
          <div className="w-64 h-1.5 bg-emerald-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400 rounded-full animate-pulse shadow-lg"
              style={{ animation: "pulse 1.5s ease-in-out infinite" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Jika tidak ada data setelah loading selesai
  if (!dashboard) {
    return (
      <div className="w-full min-h-screen font-sans bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center">
            <span className="material-icons text-emerald-400 text-4xl">
              error_outline
            </span>
          </div>
          <div className="text-emerald-800 font-black text-xl">
            Data Tidak Tersedia
          </div>
          <div className="text-emerald-600 text-center max-w-md text-sm">
            Tidak dapat memuat data dashboard. Silakan refresh halaman atau
            hubungi administrator.
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan konten dashboard setelah loading selesai
  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white">
        <div className="flex items-center gap-4 mb-3">
          <div className="bg-emerald-600 p-2 flex items-center justify-center">
            <span className="material-icons text-white text-lg">dashboard</span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
              Dashboard
            </div>
            <div className="text-emerald-600 text-sm font-medium">
              Statistik dan rekapitulasi pegawai YBWSA
            </div>
          </div>
          {/* Filter Bulan & Tahun */}
          <div className="ml-auto flex gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Bulan:
              </label>
              <select
                className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
              >
                {MONTHS.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Tahun:
              </label>
              <select
                className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const y = now.getFullYear() - 2 + i;
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </select>
            </div>
            {/* Toggle Button */}
            <button
              className="text-emerald-600 hover:text-white flex items-center justify-center hover:bg-emerald-600 focus:outline-none transition-all duration-200 bg-emerald-50 border border-emerald-200"
              onClick={() => setShowHeaderInfo((v) => !v)}
              title={showHeaderInfo ? "Sembunyikan Info" : "Tampilkan Info"}
            >
              <span className="material-icons">
                {showHeaderInfo ? "expand_less" : "expand_more"}
              </span>
            </button>
          </div>
        </div>
        {/* Info Scope & Periode */}
        {dashboard && showHeaderInfo && (
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-3 border-2 border-emerald-200 shadow-sm">
              <span className="material-icons text-emerald-600 text-lg">
                business
              </span>
              <span className="font-bold text-emerald-700 uppercase tracking-wide text-xs">
                Unit:
              </span>
              <span
                className="font-black text-emerald-800 max-w-xs truncate text-sm"
                title={dashboard.scope?.unit || "Semua Unit"}
              >
                {dashboard.scope?.unit || "Semua Unit"}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-3 border-2 border-blue-200 shadow-sm">
              <span className="material-icons text-blue-600 text-lg">
                calendar_month
              </span>
              <span className="font-bold text-blue-700 uppercase tracking-wide text-xs">
                Periode:
              </span>
              <span className="font-black text-blue-800 text-sm">
                {dashboard.periode?.nama_bulan ||
                  `${MONTHS[bulan - 1]} ${tahun}`}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 border-2 border-gray-200 shadow-sm">
              <span className="material-icons text-gray-600 text-lg">
                date_range
              </span>
              <span className="font-bold text-gray-700 uppercase tracking-wide text-xs">
                Rentang:
              </span>
              <span className="font-black text-gray-800 text-sm">
                {dashboard.periode?.start_date
                  ? `${new Date(
                      dashboard.periode.start_date
                    ).toLocaleDateString("id-ID")} - ${new Date(
                      dashboard.periode.end_date
                    ).toLocaleDateString("id-ID")}`
                  : `${MONTHS[bulan - 1]} ${tahun}`}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-3 border-2 border-yellow-200 shadow-sm">
              <span className="material-icons text-yellow-600 text-lg">
                trending_up
              </span>
              <span className="font-bold text-yellow-700 uppercase tracking-wide text-xs">
                Hari Efektif:
              </span>
              <span className="font-black text-yellow-800 text-sm">
                {dashboard.ringkasan?.ringkasan_presensi
                  ?.hari_efektif_berjalan || 0}{" "}
                hari
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="mx-auto p-6 max-w-full flex flex-col gap-8">
        <>
          {/* Info Scope & Periode Detail */}
          {dashboard && (
            <CollapsibleSection
              title="Informasi Scope & Periode"
              icon="info"
              defaultOpen={false}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informasi Unit */}
                <div className="bg-emerald-50 border-2 border-emerald-200 p-6">
                  <h3 className="font-bold text-emerald-700 mb-4 flex items-center gap-2 text-lg">
                    <span className="material-icons text-emerald-600 text-xl">
                      business
                    </span>
                    Informasi Unit
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-semibold text-gray-600 text-sm">
                        Tipe Scope:
                      </span>
                      <span className="text-emerald-700 font-bold capitalize text-sm bg-white px-3 py-1 border border-emerald-300">
                        {dashboard.scope?.type?.replace("_", " ") ||
                          "Semua Unit"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-semibold text-gray-600 text-sm">
                        Nama Unit:
                      </span>
                      <span className="text-emerald-700 font-bold text-sm bg-white px-3 py-1 border border-emerald-300 break-words">
                        {dashboard.scope?.unit || "Semua Unit"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-semibold text-gray-600 text-sm">
                        Unit ID:
                      </span>
                      <span className="text-emerald-700 font-bold text-sm bg-white px-3 py-1 border border-emerald-300 font-mono">
                        {dashboard.scope?.unit_id || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informasi Periode */}
                <div className="bg-blue-50 border-2 border-blue-200 p-6">
                  <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2 text-lg">
                    <span className="material-icons text-blue-600 text-xl">
                      calendar_month
                    </span>
                    Informasi Periode
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-semibold text-gray-600 text-sm">
                        Periode:
                      </span>
                      <span className="text-blue-700 font-bold text-sm bg-white px-3 py-1 border border-blue-300">
                        {dashboard.periode?.nama_bulan ||
                          `${MONTHS[bulan - 1]} ${tahun}`}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-semibold text-gray-600 text-sm">
                        Tanggal Mulai:
                      </span>
                      <span className="text-blue-700 font-bold text-sm bg-white px-3 py-1 border border-blue-300">
                        {dashboard.periode?.start_date
                          ? new Date(
                              dashboard.periode.start_date
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-semibold text-gray-600 text-sm">
                        Tanggal Selesai:
                      </span>
                      <span className="text-blue-700 font-bold text-sm bg-white px-3 py-1 border border-blue-300">
                        {dashboard.periode?.end_date
                          ? new Date(
                              dashboard.periode.end_date
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-semibold text-gray-600 text-sm">
                        Bulan (Angka):
                      </span>
                      <span className="text-blue-700 font-bold text-sm bg-white px-3 py-1 border border-blue-300 font-mono">
                        {dashboard.periode?.bulan || bulan}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="font-semibold text-gray-600 text-sm">
                        Tahun:
                      </span>
                      <span className="text-blue-700 font-bold text-sm bg-white px-3 py-1 border border-blue-300 font-mono">
                        {dashboard.periode?.tahun || tahun}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Tambahan */}
              <div className="mt-6 bg-gray-50 border-2 border-gray-200 p-6">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-lg">
                  <span className="material-icons text-gray-600 text-xl">
                    analytics
                  </span>
                  Informasi Tambahan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 border border-gray-300">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Total Hari dalam Bulan
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {dashboard.periode?.start_date &&
                      dashboard.periode?.end_date
                        ? Math.ceil(
                            (new Date(dashboard.periode.end_date) -
                              new Date(dashboard.periode.start_date)) /
                              (1000 * 60 * 60 * 24)
                          ) + 1
                        : new Date(tahun, bulan, 0).getDate()}
                    </div>
                  </div>
                  <div className="bg-white p-4 border border-gray-300">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Hari Efektif Berjalan
                    </div>
                    <div className="text-lg font-bold text-emerald-700">
                      {dashboard.ringkasan?.ringkasan_presensi
                        ?.hari_efektif_berjalan || 0}
                    </div>
                  </div>
                  <div className="bg-white p-4 border border-gray-300">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Persentase Hari Efektif
                    </div>
                    <div className="text-lg font-bold text-blue-700">
                      {dashboard.periode?.start_date &&
                      dashboard.periode?.end_date
                        ? `${Math.round(
                            ((dashboard.ringkasan?.ringkasan_presensi
                              ?.hari_efektif_berjalan || 0) /
                              (Math.ceil(
                                (new Date(dashboard.periode.end_date) -
                                  new Date(dashboard.periode.start_date)) /
                                  (1000 * 60 * 60 * 24)
                              ) +
                                1)) *
                              100
                          )}%`
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {summaryData.map((item) => (
              <div
                key={item.label}
                className="bg-white border-2 border-emerald-200 shadow-lg p-2 flex flex-col items-start transition-all duration-300 hover:shadow-xl hover:border-emerald-300"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="p-2 bg-emerald-100 border-2 border-emerald-200">
                    <span
                      className="material-icons text-xl"
                      style={{ color: item.color }}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-emerald-800 leading-none">
                    {item.value}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                  {item.label}
                </span>
                {/* Tampilkan persen hanya jika showPercent true dan totalSummary > 0 */}
                {item.showPercent && totalSummary > 0 ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 border border-emerald-200">
                    {((item.value / totalSummary) * 100).toFixed(1)}% dari Total
                  </span>
                ) : null}
                {item.label === "Total Expected" && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 border border-emerald-200">
                    100%
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Grafik Presensi User */}
          <CollapsibleSection title="Grafik Presensi User" icon="pie_chart">
            {userPresensiData.length > 0 ? (
              <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                <div className="md:w-1/2 flex items-center justify-center">
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={userPresensiData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label
                        >
                          {userPresensiData.map((entry, index) => (
                            <Cell
                              key={`cell-presensi-${index}`}
                              fill={userPresensiData[index].color}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="md:w-1/2 overflow-x-auto max-h-60">
                  <table className="w-full text-xs border-2 border-emerald-200">
                    <thead>
                      <tr className="bg-emerald-50 border-b-2 border-emerald-200">
                        <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                          Status
                        </th>
                        <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider">
                          Jumlah
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPresensiData.map((row, i) => (
                        <tr
                          key={row.name}
                          className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                            i % 2 === 0 ? "bg-white" : "bg-emerald-25"
                          }`}
                        >
                          <td className="px-3 py-2 text-sm">{row.name}</td>
                          <td className="px-3 py-2 text-sm font-bold text-emerald-700">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center">
                  <span className="material-icons text-emerald-400 text-4xl">
                    pie_chart
                  </span>
                </div>
                <div className="text-emerald-800 font-black text-xl">
                  Tidak Ada Data Presensi
                </div>
                <div className="text-emerald-600 text-center max-w-md text-sm">
                  Belum ada data presensi untuk periode ini atau semua nilai
                  presensi masih 0.
                </div>
              </div>
            )}
          </CollapsibleSection>
          {/* Grafik Presensi Bulanan */}
          <CollapsibleSection title="Grafik Presensi Bulanan" icon="bar_chart">
            {dataBulanan.length > 0 ? (
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataBulanan}>
                    <XAxis
                      dataKey="nama_bulan"
                      tick={{ fontWeight: 500, fill: "#166534" }}
                    />
                    <YAxis tick={{ fontWeight: 500, fill: "#166534" }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="hadir"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                      name="Hadir"
                    />
                    <Bar
                      dataKey="terlambat"
                      fill="#f59e42"
                      radius={[4, 4, 0, 0]}
                      name="Terlambat"
                    />
                    <Bar
                      dataKey="tidak_hadir"
                      fill="#f87171"
                      radius={[4, 4, 0, 0]}
                      name="Tidak Hadir"
                    />

                    <Bar
                      dataKey="lembur"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      name="Lembur"
                    />
                    <Bar
                      dataKey="tidak_absen_masuk"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                      name="Tidak Absen Masuk"
                    />
                    <Bar
                      dataKey="pulang_awal"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      name="Pulang Awal"
                    />
                    <Bar
                      dataKey="tidak_absen_pulang"
                      fill="#6b7280"
                      radius={[4, 4, 0, 0]}
                      name="Tidak Absen Pulang"
                    />

                    <Bar
                      dataKey="izin"
                      fill="#fbbf24"
                      radius={[4, 4, 0, 0]}
                      name="Izin"
                    />
                    <Bar
                      dataKey="sakit"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="Sakit"
                    />
                    <Bar
                      dataKey="cuti"
                      fill="#a78bfa"
                      radius={[4, 4, 0, 0]}
                      name="Cuti"
                    />
                    <Bar
                      dataKey="dinas"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name="Dinas"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center">
                  <span className="material-icons text-emerald-400 text-4xl">
                    bar_chart
                  </span>
                </div>
                <div className="text-emerald-800 font-black text-xl">
                  Tidak Ada Data Bulanan
                </div>
                <div className="text-emerald-600 text-center max-w-md text-sm">
                  Belum ada data presensi bulanan untuk ditampilkan.
                </div>
              </div>
            )}
          </CollapsibleSection>
          {/* Grafik Presensi Harian */}
          <CollapsibleSection title="Grafik Presensi Harian" icon="show_chart">
            {dataHarian.length > 0 ? (
              <div className="w-full overflow-y-hidden h-56">
                <ResponsiveContainer width="300%" height="100%">
                  <BarChart data={dataHarian}>
                    <XAxis
                      dataKey="tanggal"
                      tick={{ fontWeight: 500, fill: "#166534", fontSize: 10 }}
                    />
                    <YAxis tick={{ fontWeight: 500, fill: "#166534" }} />
                    <Tooltip />
                    <Legend
                      wrapperStyle={{
                        paddingTop: 10,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                      iconType="rect"
                    />
                    <Bar
                      dataKey="hadir"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                      name="Hadir"
                    />
                    <Bar
                      dataKey="terlambat"
                      fill="#f59e42"
                      radius={[4, 4, 0, 0]}
                      name="Terlambat"
                    />
                    <Bar
                      dataKey="tidak_hadir"
                      fill="#f87171"
                      radius={[4, 4, 0, 0]}
                      name="Tidak Hadir"
                    />

                    <Bar
                      dataKey="lembur"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      name="Lembur"
                    />
                    <Bar
                      dataKey="tidak_absen_masuk"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                      name="Tidak Absen Masuk"
                    />
                    <Bar
                      dataKey="pulang_awal"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      name="Pulang Awal"
                    />
                    <Bar
                      dataKey="tidak_absen_pulang"
                      fill="#6b7280"
                      radius={[4, 4, 0, 0]}
                      name="Tidak Absen Pulang"
                    />

                    <Bar
                      dataKey="izin"
                      fill="#fbbf24"
                      radius={[4, 4, 0, 0]}
                      name="Izin"
                    />
                    <Bar
                      dataKey="sakit"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="Sakit"
                    />
                    <Bar
                      dataKey="cuti"
                      fill="#a78bfa"
                      radius={[4, 4, 0, 0]}
                      name="Cuti"
                    />
                    <Bar
                      dataKey="dinas"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name="Dinas"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center">
                  <span className="material-icons text-emerald-400 text-4xl">
                    show_chart
                  </span>
                </div>
                <div className="text-emerald-800 font-black text-xl">
                  Tidak Ada Data Harian
                </div>
                <div className="text-emerald-600 text-center max-w-md text-sm">
                  Belum ada data presensi harian untuk ditampilkan.
                </div>
              </div>
            )}
          </CollapsibleSection>
          {/* Sisa Pengajuan */}
          <CollapsibleSection title="Sisa Pengajuan" icon="pending_actions">
            <div className="flex flex-wrap gap-6">
              <div className="bg-white border-2 border-emerald-200 shadow-lg p-6 flex-1 min-w-[140px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 border-2 border-emerald-200">
                    <span className="material-icons text-emerald-600 text-lg">
                      beach_access
                    </span>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    Cuti
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  {sisaPengajuan.cuti ?? 0}
                </div>
              </div>
              <div className="bg-white border-2 border-emerald-200 shadow-lg p-6 flex-1 min-w-[140px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 border-2 border-emerald-200">
                    <span className="material-icons text-emerald-600 text-lg">
                      healing
                    </span>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    Sakit
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  {sisaPengajuan.sakit ?? 0}
                </div>
              </div>
              <div className="bg-white border-2 border-emerald-200 shadow-lg p-6 flex-1 min-w-[140px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 border-2 border-emerald-200">
                    <span className="material-icons text-emerald-600 text-lg">
                      event_busy
                    </span>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    Izin
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  {sisaPengajuan.izin ?? 0}
                </div>
              </div>
              <div className="bg-white border-2 border-emerald-200 shadow-lg p-6 flex-1 min-w-[140px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 border-2 border-emerald-200">
                    <span className="material-icons text-emerald-600 text-lg">
                      assessment
                    </span>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    Total
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  {sisaPengajuan.total ?? 0}
                </div>
              </div>
            </div>
          </CollapsibleSection>
          {/* Aktivitas Terbaru */}
          <CollapsibleSection title="Aktivitas Terbaru" icon="history">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-2 border-emerald-200">
                <thead>
                  <tr className="bg-emerald-50 border-b-2 border-emerald-200">
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Pegawai
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Tanggal
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Jam
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider">
                      Tipe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aktivitas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center p-6">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center">
                            <span className="material-icons text-emerald-400 text-2xl">
                              info
                            </span>
                          </div>
                          <div className="text-emerald-800 font-black text-xl">
                            Tidak Ada Data
                          </div>
                          <div className="text-emerald-600 text-center max-w-xs text-sm">
                            Tidak ada aktivitas terbaru untuk ditampilkan.
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {aktivitas.map((row, i) => (
                    <tr
                      key={row.waktu + row.pegawai}
                      className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                        i % 2 === 0 ? "bg-white" : "bg-emerald-25"
                      }`}
                    >
                      <td className="px-3 py-2 text-sm font-semibold text-emerald-800">
                        {row.pegawai}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {row.status ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-bold border-2 ${
                              row.status === "terlambat"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : row.status === "pulang_awal"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : row.status === "hadir"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-gray-100 text-gray-800 border-gray-300"
                            }`}
                          >
                            <span className="material-icons text-xs mr-1">
                              {row.status === "terlambat"
                                ? "schedule"
                                : row.status === "pulang_awal"
                                ? "logout"
                                : row.status === "hadir"
                                ? "check_circle"
                                : "info"}
                            </span>
                            {row.status.replace("_", " ")}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-emerald-700">
                        {row.tanggal}
                      </td>
                      <td className="px-3 py-2 text-sm font-mono text-emerald-700">
                        {row.jam}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-bold border-2 ${
                            row.type === "presensi"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                          }`}
                        >
                          <span className="material-icons text-xs mr-1">
                            {row.type === "presensi" ? "fingerprint" : "info"}
                          </span>
                          {row.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        </>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .recharts-tooltip-wrapper {
            z-index: 9999 !important;
            pointer-events: none !important;
          }
          .recharts-tooltip-content {
            z-index: 9999 !important;
            pointer-events: none !important;
          }
          .recharts-tooltip-wrapper .recharts-tooltip-content {
            z-index: 9999 !important;
            pointer-events: none !important;
          }
          .recharts-tooltip-wrapper .recharts-tooltip-content .recharts-tooltip-label {
            pointer-events: none !important;
          }
          .recharts-tooltip-wrapper .recharts-tooltip-content .recharts-tooltip-item {
            pointer-events: none !important;
          }
          .recharts-legend-wrapper {
            z-index: 1 !important;
          }
          .recharts-cartesian-axis {
            z-index: 1 !important;
          }
          .recharts-bar {
            z-index: 1 !important;
          }
          .recharts-cartesian-grid {
            z-index: 1 !important;
          }
        `,
        }}
      />
    </div>
  );
}
