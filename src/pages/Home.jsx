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
    <div className="border border-gray-300 bg-white p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-emerald-700 text-lg flex items-center gap-2 tracking-wide">
          <span className="material-icons text-emerald-700 text-xl">
            {icon}
          </span>
          {title}
        </div>
        <button
          className="text-emerald-700 hover:text-emerald-900 focus:outline-none"
          onClick={() => setOpen((v) => !v)}
          title={open ? "Tutup" : "Buka"}
        >
          <span className="material-icons text-xl">
            {open ? "expand_less" : "expand_more"}
          </span>
        </button>
      </div>
      {open && <div>{children}</div>}
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

  // Gunakan Date bawaan JS
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1); // getMonth() 0-based
  const [tahun, setTahun] = useState(now.getFullYear());

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
          icon: "equalizer",
        },
        {
          label: "Attendance Rate",
          value:
            dashboard.ringkasan?.ringkasan_presensi?.attendance_rate !==
            undefined
              ? (
                  dashboard.ringkasan.ringkasan_presensi.attendance_rate
                ).toFixed(2) 
              : "-",
          color: "#6366f1",
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
          label: "Izin",
          value: dashboard.ringkasan?.ringkasan_presensi?.izin,
          color: "#fbbf24",
          icon: "event_busy",
          showPercent: true,
        },
        {
          label: "Sakit",
          value: dashboard.ringkasan?.ringkasan_presensi?.sakit,
          color: "#2563eb",
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
          icon: "work",
          showPercent: true,
        },
        {
          label: "Total Expected",
          value: dashboard.ringkasan?.ringkasan_presensi?.total_expected,
          color: "#059669",
          icon: "groups",
          showPercent: false,
        },
      ]
    : [];

  // Total summary dari total_pegawai (100%)
  const totalSummary = dashboard?.ringkasan?.ringkasan_presensi?.total_expected || 0;

  // Pie Presensi User
  const userPresensiData = dashboard
    ? [
        {
          name: "Hadir",
          value: dashboard.ringkasan.ringkasan_presensi.hadir,
          color: "#059669",
        },
        {
          name: "Izin",
          value: dashboard.ringkasan.ringkasan_presensi.izin,
          color: "#fbbf24",
        },
        {
          name: "Sakit",
          value: dashboard.ringkasan.ringkasan_presensi.sakit,
          color: "#2563eb",
        },
        {
          name: "Cuti",
          value: dashboard.ringkasan.ringkasan_presensi.cuti,
          color: "#a78bfa",
        },
        {
          name: "Tidak Hadir",
          value: dashboard.ringkasan.ringkasan_presensi.tidak_hadir,
          color: "#f87171",
        },
      ]
    : [];

  // Data bulanan
  const dataBulanan = dashboard?.charts?.data_bulanan || [];

  // Data harian
  const dataHarian = dashboard?.charts?.jumlah_data_presensi_harian || [];

  // Data aktivitas
  const aktivitas = dashboard?.aktifitas?.recent_activities || [];

  // Sisa pengajuan
  const sisaPengajuan = dashboard?.ringkasan?.sisa_pengajuan || {};

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          dashboard
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Dashboard
          </div>
          <div className="text-gray-600 text-base font-medium">
            Statistik dan rekapitulasi pegawai YBWSA
          </div>
        </div>
        {/* Filter Bulan & Tahun */}
        <div className="ml-auto flex gap-2 items-center">
          <select
            className="border rounded px-2 py-1"
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
          >
            {MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            className="border rounded px-2 py-1"
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
      </div>
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {summaryData.map((item) => (
              <div
                key={item.label}
                className="relative bg-white rounded-lg shadow-md p-5 flex flex-col items-start transition-all duration-300 hover:shadow-lg"
              >
                <div
                  className="absolute top-0 left-0 bottom-0 w-2 rounded-l-lg"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-4xl font-extrabold text-gray-800 leading-none">
                    {item.value}
                  </span>
                  <span
                    className="material-icons text-3xl opacity-70"
                    style={{ color: item.color }}
                  >
                    {item.icon}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-600 mb-1">
                  {item.label}
                </span>
                {/* Tampilkan persen hanya jika showPercent true dan totalSummary > 0 */}
                {item.showPercent && totalSummary > 0 ? (
                  <span className="text-xs font-bold text-emerald-700">
                    {((item.value / totalSummary) * 100).toFixed(1)}% dari Total
                  </span>
                ) : null}
                {item.label === "Total Expected" && (
                  <span className="text-xs font-bold text-emerald-700">
                    100%
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Grafik Presensi User */}
          <CollapsibleSection title="Grafik Presensi User" icon="pie_chart">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              <div className="md:w-1/2 flex items-center justify-center">
                <div className="w-full h-52">
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
                <table className="w-full text-xs border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 font-bold text-emerald-700">Status</th>
                      <th className="p-3 font-bold text-emerald-700">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userPresensiData.map((row, i) => (
                      <tr
                        key={row.name}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-3 border-t border-gray-100">
                          {row.name}
                        </td>
                        <td className="p-3 border-t border-gray-100">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CollapsibleSection>
          {/* Grafik Presensi Bulanan */}
          <CollapsibleSection title="Grafik Presensi Bulanan" icon="bar_chart">
            <div className="w-full h-56 ">
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
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    name="Hadir"
                  />
                  <Bar
                    dataKey="tidak_hadir"
                    fill="#f87171"
                    radius={[4, 4, 0, 0]}
                    name="Tidak Hadir"
                  />
                  <Bar
                    dataKey="izin"
                    fill="#fbbf24"
                    radius={[4, 4, 0, 0]}
                    name="Izin"
                  />
                  <Bar
                    dataKey="sakit"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                    name="Sakit"
                  />
                  <Bar
                    dataKey="cuti"
                    fill="#a78bfa"
                    radius={[4, 4, 0, 0]}
                    name="Cuti"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CollapsibleSection>
          {/* Grafik Presensi Harian */}
          <CollapsibleSection title="Grafik Presensi Harian" icon="show_chart">
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
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                    iconType="rect"
                  />
                  <Bar
                    dataKey="cuti"
                    fill="#a78bfa"
                    radius={[4, 4, 0, 0]}
                    name="Cuti"
                  />
                  <Bar
                    dataKey="hadir"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    name="Hadir"
                  />
                  <Bar
                    dataKey="izin"
                    fill="#fbbf24"
                    radius={[4, 4, 0, 0]}
                    name="Izin"
                  />
                  <Bar
                    dataKey="sakit"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                    name="Sakit"
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
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CollapsibleSection>
          {/* Sisa Pengajuan */}
          <CollapsibleSection title="Sisa Pengajuan" icon="pending_actions">
            <div className="flex flex-wrap gap-6">
              <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[120px]">
                <div className="text-lg font-bold text-gray-700">Cuti</div>
                <div className="text-2xl font-extrabold text-emerald-700">
                  {sisaPengajuan.cuti ?? 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[120px]">
                <div className="text-lg font-bold text-gray-700">Sakit</div>
                <div className="text-2xl font-extrabold text-emerald-700">
                  {sisaPengajuan.sakit ?? 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[120px]">
                <div className="text-lg font-bold text-gray-700">Izin</div>
                <div className="text-2xl font-extrabold text-emerald-700">
                  {sisaPengajuan.izin ?? 0}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[120px]">
                <div className="text-lg font-bold text-gray-700">Total</div>
                <div className="text-2xl font-extrabold text-emerald-700">
                  {sisaPengajuan.total ?? 0}
                </div>
              </div>
            </div>
          </CollapsibleSection>
          {/* Aktivitas Terbaru */}
          <CollapsibleSection title="Aktivitas Terbaru" icon="history">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 font-bold text-emerald-700">Pegawai</th>
                    <th className="p-3 font-bold text-emerald-700">Status</th>
                    <th className="p-3 font-bold text-emerald-700">Tanggal</th>
                    <th className="p-3 font-bold text-emerald-700">Jam</th>
                  </tr>
                </thead>
                <tbody>
                  {aktivitas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center p-4 text-gray-400">
                        Tidak ada aktivitas terbaru.
                      </td>
                    </tr>
                  )}
                  {aktivitas.map((row, i) => (
                    <tr
                      key={row.waktu + row.pegawai}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-3 border-t border-gray-100">
                        {row.pegawai}
                      </td>
                      <td className="p-3 border-t border-gray-100 capitalize">
                        {row.status.replace("_", " ")}
                      </td>
                      <td className="p-3 border-t border-gray-100">
                        {row.tanggal}
                      </td>
                      <td className="p-3 border-t border-gray-100">
                        {row.jam}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        </>
      </div>
    </div>
  );
}
