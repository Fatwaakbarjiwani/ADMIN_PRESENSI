import { useState, Fragment } from "react";
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

const summaryData = [
  { label: "Dosen Aktif", value: 32, color: "#059669", icon: "person" },
  { label: "Karyawan Aktif", value: 45, color: "#2563eb", icon: "badge" },
  { label: "Tidak Aktif", value: 8, color: "#f59e42", icon: "block" },
];
const total = summaryData.reduce((acc, cur) => acc + cur.value, 0);

const bidangKerjaData = [
  { name: "Administrasi", value: 12 },
  { name: "Dosen DPK", value: 8 },
  { name: "Dosen PNS", value: 6 },
  { name: "Dosen Tetap", value: 10 },
  { name: "Laboran", value: 4 },
  { name: "Programmer", value: 2 },
  { name: "Pustakawan", value: 3 },
  { name: "Security", value: 4 },
];

const jenisKaryawanData = [
  { name: "Tetap", value: 30 },
  { name: "Kontrak", value: 20 },
  { name: "Honorer", value: 15 },
];

const statusKaryawanData = [
  { name: "Aktif", value: 70 },
  { name: "Mengundurkan Diri", value: 5 },
  { name: "Pensiun", value: 6 },
  { name: "Cuti", value: 2 },
];

const golonganData = [
  { golongan: "III/a", pangkat: "Penata Muda", jumlah: 10 },
  { golongan: "III/b", pangkat: "Penata Muda Tk.I", jumlah: 8 },
  { golongan: "III/c", pangkat: "Penata", jumlah: 6 },
  { golongan: "IV/a", pangkat: "Pembina", jumlah: 4 },
];

const pendidikanData = [
  { tingkat: "SMA/SMK", jumlah: 10 },
  { tingkat: "D3", jumlah: 8 },
  { tingkat: "S1", jumlah: 40 },
  { tingkat: "S2", jumlah: 15 },
  { tingkat: "S3", jumlah: 3 },
];

const jabatanFungsionalData = [
  { jabatan: "Asisten Ahli", jumlah: 8 },
  { jabatan: "Lektor", jumlah: 12 },
  { jabatan: "Lektor Kepala", jumlah: 6 },
  { jabatan: "Guru Besar", jumlah: 2 },
];

const statusKerjaData = [
  { label: "Fulltime", value: 60, color: "#059669" },
  { label: "Kontrak", value: 20, color: "#2563eb" },
  { label: "Parttime", value: 15, color: "#f59e42" },
];
const totalStatus = statusKerjaData.reduce((acc, cur) => acc + cur.value, 0);

const COLORS = [
  "#059669",
  "#2563eb",
  "#f59e42",
  "#f87171",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#facc15",
];

const bidangKerjaStatusData = [
  {
    jenis: "Administrasi",
    total: 150,
    status: [
      { label: "Full Time", value: 100, color: "#3b82f6" },
      { label: "Kontrak", value: 48, color: "#f59e42" },
      { label: "Part Time", value: 1, color: "#e11d48" },
      { label: "PNS/DPK", value: 1, color: "#64748b" },
    ],
  },
  {
    jenis: "Dosen DPK",
    total: 4,
    status: [
      { label: "Full Time", value: 2, color: "#f59e42" },
      { label: "Kontrak", value: 2, color: "#f59e42" },
    ],
  },
  {
    jenis: "Dosen PNS",
    total: 6,
    status: [
      { label: "Full Time", value: 2, color: "#f59e42" },
      { label: "Kontrak", value: 3, color: "#f59e42" },
      { label: "PNS/DPK", value: 1, color: "#e11d48" },
    ],
  },
  {
    jenis: "Laboran",
    total: 15,
    status: [{ label: "Full Time", value: 15, color: "#22c55e" }],
  },
];

const userPresensiData = [
  { name: "Hadir", value: 80, color: "#059669" },
  { name: "Izin", value: 10, color: "#fbbf24" },
  { name: "Sakit", value: 5, color: "#2563eb" },
  { name: "Alfa", value: 5, color: "#f87171" },
];

function CollapsibleSection({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-300 bg-white p-4">
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

export default function Home() {
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
            Statistik dan rekapitulasi pegawai/dosen UNISSULA
          </div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {summaryData.map((item) => (
            <div
              key={item.label}
              className="relative bg-white border border-gray-200 flex flex-col items-start p-4 pl-5"
              style={{ borderLeft: `6px solid ${item.color}` }}
            >
              <span
                className="absolute top-2 right-3 material-icons text-xl select-none pointer-events-none"
                style={{ color: item.color }}
              >
                {item.icon}
              </span>
              <span className="text-3xl font-extrabold text-gray-800 leading-none mb-1 mt-2">
                {item.value}
              </span>
              <span className="text-xs font-semibold text-gray-500 mb-0.5">
                {item.label}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
          <div
            className="relative bg-white border border-gray-200 flex flex-col items-start p-4 pl-5"
            style={{ borderLeft: `6px solid #fbbf24` }}
          >
            <span
              className="absolute top-2 right-3 material-icons text-xl select-none pointer-events-none"
              style={{ color: "#fbbf24" }}
            >
              equalizer
            </span>
            <span className="text-3xl font-extrabold text-gray-800 leading-none mb-1 mt-2">
              {total}
            </span>
            <span className="text-xs font-semibold text-gray-500 mb-0.5">
              Total
            </span>
            <span className="text-xs font-bold text-emerald-700">100%</span>
          </div>
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
        {/* Bidang Kerja Karyawan */}
        <CollapsibleSection title="Bidang Kerja Karyawan" icon="bar_chart">
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bidangKerjaData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontWeight: 500, fill: "#166534" }}
                />
                <YAxis tick={{ fontWeight: 500, fill: "#166534" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Tabel breakdown status per jenis pegawai */}
          <div className="overflow-x-auto mt-8">
            <table className="min-w-full text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-bold text-gray-500">
                    No
                  </th>
                  <th className="px-3 py-2 text-left font-bold text-gray-500">
                    Jenis Pegawai
                  </th>
                  <th className="px-3 py-2 text-center font-bold text-gray-500">
                    Total
                  </th>
                  <th className="px-3 py-2 text-left font-bold text-gray-500">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left font-bold text-gray-500">
                    Progress
                  </th>
                  <th className="px-3 py-2 text-center font-bold text-gray-500">
                    Jumlah
                  </th>
                </tr>
              </thead>
              <tbody>
                {bidangKerjaStatusData.map((row, idx) => (
                  <Fragment key={row.jenis}>
                    <tr
                      key={row.jenis}
                      className="border-t border-gray-100 bg-white"
                    >
                      <td className="px-3 py-2 align-top text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 align-top font-bold text-gray-700">
                        {row.jenis}
                      </td>
                      <td className="px-3 py-2 align-top text-center font-bold text-gray-800">
                        {row.total}
                      </td>
                      <td className="px-3 py-2 align-top" colSpan={3}></td>
                    </tr>
                    {row.status.map((s) => (
                      <tr
                        key={row.jenis + s.label}
                        className="border-t border-gray-50 bg-gray-50"
                      >
                        <td className="px-3 py-1"></td>
                        <td className="px-3 py-1"></td>
                        <td className="px-3 py-1"></td>
                        <td className="px-3 py-1 text-gray-600">{s.label}</td>
                        <td className="px-3 py-1 w-40">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full"
                              style={{
                                width: `${(s.value / row.total) * 100}%`,
                                background: s.color,
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-3 py-1 text-center text-gray-700">
                          {s.value}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {/* Progressbar status kerja */}
          <div className="mt-6 space-y-2">
            {statusKerjaData.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-500">
                    {item.value} (
                    {((item.value / totalStatus) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${(item.value / totalStatus) * 100}%`,
                      background: item.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center text-xs font-semibold mt-2">
              <span className="text-gray-500">Total</span>
              <span className="text-gray-700">{totalStatus}</span>
            </div>
          </div>
        </CollapsibleSection>
        {/* Jenis Karyawan */}
        <CollapsibleSection title="Tipe Jenis Karyawan" icon="pie_chart">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 flex items-center justify-center">
              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jenisKaryawanData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {jenisKaryawanData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
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
                    <th className="p-3 font-bold text-emerald-700">Jenis</th>
                    <th className="p-3 font-bold text-emerald-700">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {jenisKaryawanData.map((row, i) => (
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
        {/* Status Karyawan */}
        <CollapsibleSection title="Status Karyawan" icon="donut_large">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 flex items-center justify-center">
              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusKaryawanData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {statusKaryawanData.map((entry, index) => (
                        <Cell
                          key={`cell-status-${index}`}
                          fill={COLORS[index % COLORS.length]}
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
                  {statusKaryawanData.map((row, i) => (
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
        {/* Golongan Karyawan */}
        <CollapsibleSection title="Golongan Karyawan" icon="table_chart">
          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={golonganData}>
                <XAxis
                  dataKey="golongan"
                  tick={{ fontWeight: 500, fill: "#166534" }}
                />
                <YAxis tick={{ fontWeight: 500, fill: "#166534" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="jumlah" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto max-h-60 mt-4">
            <table className="w-full text-xs border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 font-bold text-emerald-700">Golongan</th>
                  <th className="p-3 font-bold text-emerald-700">Pangkat</th>
                  <th className="p-3 font-bold text-emerald-700">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {golonganData.map((row, i) => (
                  <tr
                    key={row.golongan}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 border-t border-gray-100">
                      {row.golongan}
                    </td>
                    <td className="p-3 border-t border-gray-100">
                      {row.pangkat}
                    </td>
                    <td className="p-3 border-t border-gray-100">
                      {row.jumlah}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
        {/* Pendidikan Karyawan */}
        <CollapsibleSection title="Pendidikan Karyawan" icon="school">
          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pendidikanData}>
                <XAxis
                  dataKey="tingkat"
                  tick={{ fontWeight: 500, fill: "#166534" }}
                />
                <YAxis tick={{ fontWeight: 500, fill: "#166534" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="jumlah" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CollapsibleSection>
        {/* Jabatan Fungsional Akademik */}
        <CollapsibleSection
          title="Jabatan Fungsional Akademik"
          icon="workspace_premium"
        >
          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jabatanFungsionalData}>
                <XAxis
                  dataKey="jabatan"
                  tick={{ fontWeight: 500, fill: "#166534" }}
                />
                <YAxis tick={{ fontWeight: 500, fill: "#166534" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="jumlah" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
