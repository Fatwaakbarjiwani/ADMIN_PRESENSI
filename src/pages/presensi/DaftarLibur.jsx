import { useState } from "react";

const dummyLibur = [
  // Contoh data
  {
    id: 1,
    shift: "SHF PAGI",
    bulan: "Juli",
    tanggal: ["2024-07-01", "2024-07-17"],
  },
  { id: 2, shift: "SHF SIANG", bulan: "Juli", tanggal: ["2024-07-10"] },
  {
    id: 3,
    shift: "SHF OB",
    bulan: "Juli",
    tanggal: ["2024-07-04", "2024-07-20"],
  },
];

const bulanList = [
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

export default function DaftarLibur() {
  const [bulan, setBulan] = useState("Juli");
  const [showCount, setShowCount] = useState(10);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Filter data
  const filtered = dummyLibur.filter(
    (d) =>
      d.bulan === bulan &&
      (d.shift.toLowerCase().includes(search.toLowerCase()) ||
        d.tanggal.join(",").includes(search))
  );
  const total = filtered.length;
  const totalPages = Math.ceil(total / showCount) || 1;
  const paginated = filtered.slice((page - 1) * showCount, page * showCount);

  function handlePage(dir) {
    setPage((p) => Math.max(1, Math.min(totalPages, p + dir)));
  }

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-50 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          {"holiday_village"}
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            DAFTAR LIBUR
          </div>
          <div className="text-gray-600 text-base font-medium">
            kelola daftar libur dengan mudah
          </div>
        </div>
      </div>
      <div className="py-4 max-w-5xl mx-auto">
        <div className="bg-white border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-500">Bulan</span>
              <select
                className="border border-gray-200 rounded px-2 py-1 text-sm font-semibold bg-gray-50"
                value={bulan}
                onChange={(e) => {
                  setBulan(e.target.value);
                  setPage(1);
                }}
              >
                {bulanList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="show-entries"
                className="text-xs text-gray-600 font-semibold"
              >
                Show entries
              </label>
              <select
                id="show-entries"
                className="border border-gray-200 rounded px-2 py-1 text-xs bg-gray-50"
                value={showCount}
                onChange={(e) => {
                  setShowCount(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 25, 50, 100].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="search-libur"
                className="text-xs text-gray-600 font-semibold"
              >
                Search:
              </label>
              <input
                id="search-libur"
                type="text"
                className="border border-gray-200 rounded px-2 py-1 text-xs bg-gray-50"
                placeholder="Cari shift/tanggal"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-sm border-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-center w-10">
                    No
                  </th>
                  <th className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-left min-w-[140px]">
                    Shift
                  </th>
                  <th className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-center w-32">
                    Bulan
                  </th>
                  <th className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-center min-w-[180px]">
                    Tanggal Libur
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-6">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`group transition-all duration-150 border-b border-gray-200 ${
                        idx % 2 === 1 ? "" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-center align-middle font-medium">
                        {(page - 1) * showCount + idx + 1}
                      </td>
                      <td className="px-4 py-3 text-left align-middle font-medium flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200">
                          {row.shift
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        {row.shift}
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        {row.bulan}
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        {row.tanggal.map((tgl) => (
                          <span
                            key={tgl}
                            className="inline-block border border-blue-200 bg-blue-50 text-blue-700 rounded-full px-3 py-0.5 text-xs font-semibold mr-1 mb-1"
                          >
                            {new Date(tgl).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-2">
            <div className="text-xs text-gray-500">
              Showing {total === 0 ? 0 : (page - 1) * showCount + 1} to{" "}
              {Math.min(page * showCount, total)} of {total} entries
            </div>
            <div className="flex gap-1 justify-end">
              <button
                className="px-2 py-1 border border-gray-200 rounded bg-white text-gray-600 hover:bg-emerald-50 disabled:opacity-50 flex items-center gap-1"
                onClick={() => handlePage(-1)}
                disabled={page === 1}
              >
                <span className="material-icons text-base">chevron_left</span>{" "}
                Prev
              </button>
              <button
                className="px-2 py-1 border border-gray-200 rounded bg-white text-gray-600 hover:bg-emerald-50 disabled:opacity-50 flex items-center gap-1"
                onClick={() => handlePage(1)}
                disabled={page === totalPages}
              >
                Next{" "}
                <span className="material-icons text-base">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
