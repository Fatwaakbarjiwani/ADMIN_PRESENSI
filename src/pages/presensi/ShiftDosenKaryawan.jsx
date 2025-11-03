import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import {
  fetchPegawai,
  assignPegawaiToShift,
} from "../../redux/actions/shiftAction";

export default function ShiftDosenKaryawan() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const pegawai = useSelector((state) => state.shift.pegawai);
  const pagination = useSelector((state) => state.shift.pegawaiPagination);
  // const loading = useSelector((state) => state.shift.loading);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedPegawai, setSelectedPegawai] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [tab, setTab] = useState("data"); // default: data karyawan
  const user = useSelector((state) => state.auth.user);

  // Fetch karyawan redux
  useEffect(() => {
    if (assignLoading == false || user !== null) {
      dispatch(fetchPegawai(page));
    }
  }, [dispatch, page, assignLoading, user]);

  // Fetch shift list
  useEffect(() => {
    if (token || assignLoading == false) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/shift`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setShifts(res.data))
        .catch(() => setShifts([]));
    }
  }, [token, assignLoading]);

  // Assign shift
  const handleAssignShift = () => {
    if (!selectedShift || selectedPegawai.length === 0) {
      Swal.fire({ icon: "warning", title: "Pilih shift dan karyawan!" });
      return;
    }
    setAssignLoading(true);
    dispatch(
      assignPegawaiToShift(selectedShift, selectedPegawai, () =>
        setSelectedPegawai([])
      )
    ).finally(() => setAssignLoading(false));
  };
 
  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white text-lg">event</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Shift Dosen Karyawan
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Kelola shift dosen dan karyawan
          </div>
        </div>
      </div>
      <div className="mx-auto p-6 max-w-7xl flex flex-col gap-6">
        {/* Tab Navigation */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          <div className="flex">
            <button
              className={`flex-1 px-4 py-2 font-semibold text-sm transition-all duration-200 border-r-2 border-emerald-200 last:border-r-0 flex items-center gap-2 ${
                tab === "data"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-700 hover:bg-emerald-50"
              }`}
              onClick={() => setTab("data")}
            >
              <span className="material-icons text-lg">people</span>
              Data Karyawan
            </button>
            <button
              className={`flex-1 px-4 py-2 font-semibold text-sm transition-all duration-200 border-r-2 border-emerald-200 last:border-r-0 flex items-center gap-2 ${
                tab === "atur"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-700 hover:bg-emerald-50"
              }`}
              onClick={() => setTab("atur")}
            >
              <span className="material-icons text-lg">tune</span>
              Atur Shift
            </button>
          </div>
        </div>
        {/* Tab content */}
        {tab === "data" && (
          <div className="bg-white border-2 border-emerald-200 shadow-lg">
            {/* Card Header */}
            <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2">
                    <span className="material-icons text-lg text-emerald-600">
                      people
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wide">
                      Data Karyawan
                    </h2>
                    <p className="text-emerald-100 text-xs font-medium">
                      Daftar semua data karyawan dan dosen
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-emerald-100 uppercase tracking-wide">
                    Cari:
                  </label>
                  <input
                    type="text"
                    placeholder="Cari Nama/NIK/Unit"
                    className="px-3 py-2 border-2 border-emerald-300 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white placeholder-gray-500 min-w-[200px]"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      dispatch(fetchPegawai(1, e.target.value));
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm bg-white">
                  <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                    <tr>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        No
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        Nama Lengkap
                        <div className="text-xs font-normal text-emerald-600 normal-case">
                          (dengan gelar)
                        </div>
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        NIK
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        No. HP
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        Tempat Lahir
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        Tanggal Lahir
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        <div className="flex flex-col leading-tight">
                          <span>Unit</span>
                          <span className="text-xs font-normal text-emerald-600 normal-case">
                            Detail Unit
                          </span>
                        </div>
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider">
                        Shift
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pegawai.length > 0 ? (
                      pegawai.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                            idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                          }`}
                        >
                          <td className="px-3 py-2 text-center text-sm font-semibold">
                            {idx +
                              1 +
                              ((pagination.current_page - 1) * 20 || 0)}
                          </td>
                          <td className="px-3 py-2 text-sm font-bold text-emerald-800">
                            {[row.gelar_depan, row.nama, row.gelar_belakang]
                              .filter(Boolean)
                              .join(" ")}
                          </td>
                          <td className="px-3 py-2 text-sm text-emerald-700 font-medium">
                            {row.no_ktp}
                          </td>
                          <td className="px-3 py-2 text-sm text-emerald-700 font-medium">
                            {row.no_hp}
                          </td>
                          <td className="px-3 py-2 text-sm text-emerald-700 font-medium">
                            {row.tmpt_lahir}
                          </td>
                          <td className="px-3 py-2 text-sm text-emerald-700 font-medium">
                            {row.tgl_lahir}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {row.nama_unit ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {row.nama_unit}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 border border-gray-300">
                                -
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {row.nama_shift ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {row.nama_shift}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 border border-gray-300">
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mb-4">
                              <span className="material-icons text-emerald-400 text-2xl">
                                person_off
                              </span>
                            </div>
                            <div className="text-emerald-800 font-black text-xl mb-1">
                              Tidak Ada Data
                            </div>
                            <div className="text-emerald-600 text-center max-w-xs text-sm">
                              Belum ada data karyawan yang tersedia
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {pagination.last_page > 1 && (
                <div className="flex flex-wrap gap-1 justify-center mt-4 bg-emerald-50 border-t-2 border-emerald-200 px-6 py-4">
                  {pagination.links.map((link, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 text-xs font-bold border-2 transition-all duration-200 ${
                        link.active
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-lg"
                          : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400"
                      }`}
                      onClick={() => {
                        if (link.url) {
                          const url = new URL(link.url);
                          const p = url.searchParams.get("page");
                          if (p) setPage(Number(p));
                        }
                      }}
                      disabled={!link.url || link.active}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {tab === "atur" && (
          <div className="bg-white border-2 border-emerald-200 shadow-lg">
            {/* Card Header */}
            <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2">
                    <span className="material-icons text-lg text-emerald-600">
                      tune
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wide">
                      Atur Shift
                    </h2>
                    <p className="text-emerald-100 text-xs font-medium">
                      Pilih shift dan assign karyawan
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-emerald-100 uppercase tracking-wide">
                    Cari:
                  </label>
                  <input
                    type="text"
                    placeholder="Cari Nama/NIK/Unit"
                    className="px-3 py-2 border-2 border-emerald-300 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white placeholder-gray-500 min-w-[200px]"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      dispatch(fetchPegawai(1, e.target.value));
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                      Pilih Shift
                    </label>
                    <select
                      className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                      value={selectedShift}
                      onChange={(e) => setSelectedShift(e.target.value)}
                    >
                      <option value="">Pilih Shift</option>
                      {shifts.map((s) => (
                        <option
                          key={s.shift_detail?.id || s.id}
                          value={s.shift_detail?.id || s.id}
                        >
                          {s.name}{s.unit_name ? ` ( ${s.unit_name} )` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-2 border-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1 disabled:opacity-60"
                      onClick={handleAssignShift}
                      disabled={
                        assignLoading ||
                        !selectedShift ||
                        selectedPegawai.length === 0
                      }
                    >
                      {assignLoading ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-sm">save</span>
                          Atur Shift
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[420px] md:max-h-[520px]">
                <table className="min-w-full text-sm bg-white">
                  <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                    <tr>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        No
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        Nama Lengkap
                        <div className="text-xs font-normal text-emerald-600 normal-case">
                          (dengan gelar)
                        </div>
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        Shift
                      </th>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider">
                        Pilih
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pegawai.length > 0 ? (
                      pegawai.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                            idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                          }`}
                        >
                          <td className="px-3 py-2 text-center text-sm font-semibold">
                            {idx +
                              1 +
                              ((pagination.current_page - 1) * 20 || 0)}
                          </td>
                          <td className="px-3 py-2 text-sm font-bold text-emerald-800">
                            {row.nama}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {row.nama_shift ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {row.nama_shift}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 border border-gray-300">
                                -
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={selectedPegawai.includes(row.id)}
                              onChange={(e) => {
                                if (e.target.checked)
                                  setSelectedPegawai((prev) => [
                                    ...prev,
                                    row.id,
                                  ]);
                                else
                                  setSelectedPegawai((prev) =>
                                    prev.filter((id) => id !== row.id)
                                  );
                              }}
                              className="rounded border-2 border-emerald-300"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mb-4">
                              <span className="material-icons text-emerald-400 text-2xl">
                                person_off
                              </span>
                            </div>
                            <div className="text-emerald-800 font-black text-xl mb-1">
                              Tidak Ada Data
                            </div>
                            <div className="text-emerald-600 text-center max-w-xs text-sm">
                              Belum ada data karyawan yang tersedia
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {pagination.last_page > 1 && (
                <div className="flex flex-wrap gap-1 justify-center mt-4 bg-emerald-50 border-t-2 border-emerald-200 px-6 py-4">
                  {pagination.links.map((link, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 text-xs font-bold border-2 transition-all duration-200 ${
                        link.active
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-lg"
                          : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400"
                      }`}
                      onClick={() => {
                        if (link.url) {
                          const url = new URL(link.url);
                          const p = url.searchParams.get("page");
                          if (p) setPage(Number(p));
                        }
                      }}
                      disabled={!link.url || link.active}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
