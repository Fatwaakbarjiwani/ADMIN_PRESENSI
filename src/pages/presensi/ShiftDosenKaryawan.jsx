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
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          event
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Shift Karyawan
          </div>
          <div className="text-gray-600 text-base font-medium">
            Manajemen karyawan & pembagian shift
          </div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        {/* Tab menu */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-base border-b-4 transition-all duration-150 focus:outline-none ${
              tab === "data"
                ? "border-emerald-600 text-emerald-600 bg-white shadow-sm"
                : "border-transparent text-gray-500 bg-gray-100"
            }`}
            onClick={() => setTab("data")}
          >
            Data Karyawan
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-bold text-base border-b-4 transition-all duration-150 focus:outline-none ${
              tab === "atur"
                ? "border-emerald-600 text-emerald-600 bg-white shadow-sm"
                : "border-transparent text-gray-500 bg-gray-100"
            }`}
            onClick={() => setTab("atur")}
          >
            Atur Shift
          </button>
        </div>
        {/* Tab content */}
        {tab === "data" && (
          <div className="border border-gray-200 bg-white p-6 shadow flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-bold text-emerald-600 mb-2 text-xl flex items-center gap-2">
                <span className="material-icons text-emerald-600 text-2xl">
                  people
                </span>
                Data Karyawan
              </div>
              <div>
                <span className="text-gray-400">
                  <span className="text-xs">search :</span>
                </span>
                <div className="relative bg-white flex items-center">
                  <input
                    type="text"
                    placeholder="Cari Nama/NIK/Unit"
                    className="p-2 w-full rounded border border-gray-200 outline-none text-sm"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      dispatch(fetchPegawai(1, e.target.value));
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm bg-white">
                <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                  <tr>
                    <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-12">
                      No
                    </th>
                    <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-56">
                      Nama Lengkap
                      <div className="text-xs font-normal text-gray-400 normal-case">
                        (dengan gelar)
                      </div>
                    </th>
                    <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                      NIK
                    </th>
                    <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                      Jabatan
                    </th>
                    <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                      <div className="flex flex-col leading-tight">
                        <span>Unit</span>
                        <span className="text-xs font-normal text-gray-400 normal-case">
                          Detail Unit
                        </span>
                      </div>
                    </th>
                    <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                      Shift
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pegawai.length > 0 ? (
                    pegawai.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={
                          "transition hover:bg-emerald-50 " +
                          (idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                        }
                      >
                        <td className="px-2 py-3 text-center align-middle border-b border-gray-100 font-semibold">
                          {idx + 1 + ((pagination.current_page - 1) * 20 || 0)}
                        </td>
                        <td className="px-2 py-3 font-bold align-middle border-b border-gray-100 text-emerald-800">
                          {[row.gelar_depan, row.nama, row.gelar_belakang]
                            .filter(Boolean)
                            .join(" ")}
                        </td>
                        <td className="px-2 py-3 align-middle border-b border-gray-100">
                          {row.nipy || row.no_ktp}
                        </td>
                        <td className="px-2 py-3 align-middle border-b border-gray-100">
                          {row.jabatan}
                        </td>
                        <td className="px-2 py-3 align-middle border-b border-gray-100">
                          {row.unit_detail_name}
                        </td>
                        <td className="px-2 py-3 align-middle border-b border-gray-100">
                          {row.shift_name ? (
                            <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-bold">
                              {row.shift_name}
                            </span>
                          ) : (
                            <span className="inline-block bg-gray-100 text-gray-400 px-2 py-0.5 text-xs">
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center text-gray-400 py-4"
                      >
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pagination.last_page > 1 && (
              <div className="flex flex-wrap gap-1 justify-center mt-4">
                {pagination.links.map((link, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 rounded text-xs font-bold border transition ${
                      link.active
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-100"
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
        )}
        {tab === "atur" && (
          <div className="border border-gray-200 bg-white p-6 shadow flex flex-col gap-2">
            <div className="font-bold text-emerald-600 text-xl flex items-center gap-2">
              <span className="material-icons text-emerald-600 text-2xl">
                tune
              </span>
              Atur Shift
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-2 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <select
                  className="border border-emerald-400 rounded px-2 py-1 text-xs"
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                >
                  <option value="">Pilih Shift</option>
                  {shifts.map((s) => (
                    <option
                      key={s.shift_detail?.id || s.id}
                      value={s.shift_detail?.id || s.id}
                    >
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded disabled:opacity-60"
                  onClick={handleAssignShift}
                  disabled={
                    assignLoading ||
                    !selectedShift ||
                    selectedPegawai.length === 0
                  }
                >
                  {assignLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>{" "}
                      Menyimpan...
                    </span>
                  ) : (
                    "Atur Shift"
                  )}
                </button>
              </div>
              <div>
                <span className="text-gray-400">
                  <span className="text-xs">search :</span>
                </span>
                <div className="relative bg-white flex items-center">
                  <input
                    type="text"
                    placeholder="Cari Nama/NIK/Unit"
                    className="p-2 w-full rounded border border-gray-200 outline-none text-sm"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      dispatch(fetchPegawai(1, e.target.value));
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[420px] md:max-h-[520px]">
              <table className="min-w-full text-sm bg-white">
                <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                  <tr>
                    <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-12">
                      No
                    </th>
                    <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-56">
                      Nama Lengkap
                      <div className="text-xs font-normal text-gray-400 normal-case">
                        (dengan gelar)
                      </div>
                    </th>
                    <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                      Shift
                    </th>
                    <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-24">
                      Pilih
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pegawai.length > 0 ? (
                    pegawai.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={
                          "transition hover:bg-emerald-50 " +
                          (idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                        }
                      >
                        <td className="px-2 py-3 text-center align-middle border-b border-gray-100 font-semibold">
                          {idx + 1 + ((pagination.current_page - 1) * 20 || 0)}
                        </td>
                        <td className="px-2 py-3 font-bold align-middle border-b border-gray-100 text-emerald-800">
                          {[row.gelar_depan, row.nama, row.gelar_belakang]
                            .filter(Boolean)
                            .join(" ")}
                        </td>
                        <td className="px-2 py-3 align-middle border-b border-gray-100">
                          {row.shift_name ? (
                            <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-bold">
                              {row.shift_name}
                            </span>
                          ) : (
                            <span className="inline-block bg-gray-100 text-gray-400 px-2 py-0.5 text-xs">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center align-middle border-b border-gray-100">
                          <input
                            type="checkbox"
                            checked={selectedPegawai.includes(row.id)}
                            onChange={(e) => {
                              if (e.target.checked)
                                setSelectedPegawai((prev) => [...prev, row.id]);
                              else
                                setSelectedPegawai((prev) =>
                                  prev.filter((id) => id !== row.id)
                                );
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-gray-400 py-4"
                      >
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pagination.last_page > 1 && (
              <div className="flex flex-wrap gap-1 justify-center mt-4">
                {pagination.links.map((link, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 rounded text-xs font-bold border transition ${
                      link.active
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-100"
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
        )}
      </div>
    </div>
  );
}
