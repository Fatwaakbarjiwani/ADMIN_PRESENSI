import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchEvent } from "../../redux/actions/presensiAction";
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";

export default function Event() {
  const event = useSelector((state) => state.presensi.event);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const units = useSelector((state) => state.unitDetail.units);
  const isSuperAdmin = user?.role === "super_admin";

  const [selectedUnit, setSelectedUnit] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isSuperAdmin) {
      dispatch(fetchAllUnit());
    }
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) {
      dispatch(fetchEvent(search, null, false, null));
      return;
    }
    if (selectedUnit) {
      dispatch(fetchEvent(search, selectedUnit, true, null));
    }
  }, [dispatch, isSuperAdmin, selectedUnit, search]);

  const eventList = Array.isArray(event) ? event : [];

  const unitsFlat = Array.isArray(units) ? units : [];
  const getParentId = (u) => {
    const id = u.parent_id ?? u.id_parent ?? u.parent;
    return id === undefined || id === null ? "root" : id;
  };
  const childrenByParent = unitsFlat.reduce((acc, u) => {
    const pid = getParentId(u);
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(u);
    return acc;
  }, {});
  const buildOrdered = (parentKey, depth) => {
    const list = [];
    (childrenByParent[parentKey] || []).forEach((unit) => {
      list.push({ ...unit, depth });
      list.push(...buildOrdered(unit.id, depth + 1));
    });
    return list;
  };
  const unitsHierarchy = buildOrdered("root", 0);

  const indentLabel = (depth, nama) => {
    const d = depth || 0;
    const space = "\u00A0".repeat(d * 3);
    const prefix = d > 0 ? "›\u00A0" : "";
    return `${space}${prefix}${nama}`;
  };

  const formatTime = (t) => {
    if (!t) return "-";
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
  };

  const handleTambahEvent = () => {
    navigate("/event/tambah", { state: isSuperAdmin ? { unitId: selectedUnit } : {} });
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white text-lg">event</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Manajemen Event
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Kelola data event presensi
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-full flex flex-col gap-6">
        {/* Action Bar */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          <div className="bg-emerald-50 px-4 py-3 border-b-2 border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2">
                <span className="material-icons text-white text-sm">filter_list</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">
                  Filter & Pencarian
                </h3>
                <p className="text-xs text-emerald-600">
                  Atur filter dan cari data event
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleTambahEvent}
                  disabled={isSuperAdmin && !selectedUnit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs border-2 border-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1"
                >
                  <span className="material-icons text-sm">add</span>
                  Tambah Event
                </button>
              </div>
              <div className="flex flex-wrap gap-3 items-center flex-1">
                {isSuperAdmin && (
                  <div className="flex flex-col min-w-[200px]">
                    <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                      Unit
                    </label>
                    <select
                      className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                    >
                      <option value="">Pilih Unit</option>
                      {unitsHierarchy.map((unit) => {
                        const depth = unit.depth ?? 0;
                        const nama = unit?.nama ?? unit?.name ?? unit.id;
                        return (
                          <option key={unit.id} value={unit.id}>
                            {indentLabel(depth, nama)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <div className="flex flex-col min-w-[200px]">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                    Cari
                  </label>
                  <input
                    type="text"
                    placeholder="Cari event..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {isSuperAdmin && !selectedUnit && (
          <div className="bg-white border-2 border-emerald-200 shadow-lg">
            <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2">
                  <span className="material-icons text-lg text-emerald-600">visibility</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wide">
                    Pilih Unit
                  </h2>
                  <p className="text-emerald-100 text-xs font-medium">
                    Pilih unit untuk menampilkan data event
                  </p>
                </div>
              </div>
            </div>
            <div className="p-8 flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center">
                <span className="material-icons text-emerald-600 text-3xl">event</span>
              </div>
              <p className="text-emerald-700 font-medium text-center">
                Silakan pilih unit terlebih dahulu untuk menampilkan data event
              </p>
            </div>
          </div>
        )}

        {(user?.role !== "super_admin" || (user?.role === "super_admin" && selectedUnit)) && (
          <div className="bg-white border-2 border-emerald-200 shadow-lg">
            <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2">
                  <span className="material-icons text-lg text-emerald-600">event_note</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wide">
                    Data Event
                  </h2>
                  <p className="text-emerald-100 text-xs font-medium">
                    Daftar semua data event
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-b-2 border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-2 text-emerald-700">
                <span className="material-icons text-emerald-600">description</span>
                <span className="font-bold text-sm">Total Data: {eventList.length} records</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                  <tr>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      NO
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      NAMA EVENT
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      DESKRIPSI
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      TIPE
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      WAKTU
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      TEMPAT
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      STATUS
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider">
                      AKSI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eventList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                        Tidak ada data event
                      </td>
                    </tr>
                  ) : (
                    eventList.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`transition hover:bg-emerald-50 border-b border-emerald-100 ${
                          idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                        }`}
                      >
                        <td className="px-3 py-2 text-center text-sm font-semibold">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 text-center text-sm font-bold text-emerald-800">
                          {row.nama_event ?? row.nama ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-center text-sm max-w-xs truncate">
                          {row.deskripsi ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-center text-sm">
                          {row.tipe_event ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-center text-sm">
                          {formatTime(row.waktu_mulai)} - {formatTime(row.waktu_selesai)}
                        </td>
                        <td className="px-3 py-2 text-center text-sm">
                          {row.nama_tempat ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-bold border ${
                              row.is_active
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}
                          >
                            {row.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => navigate(`/event/${row.id}`)}
                              className="w-8 h-8 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 hover:border-emerald-300 transition-all duration-200"
                              title="Lihat detail"
                            >
                              <span className="material-icons text-sm">visibility</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/event/${row.id}/edit`)}
                              className="w-8 h-8 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-200 hover:border-amber-300 transition-all duration-200"
                              title="Edit event"
                            >
                              <span className="material-icons text-sm">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/event/${row.id}/pegawai`)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200 hover:border-blue-300 transition-all duration-200"
                              title="Tambah pegawai ke event"
                            >
                              <span className="material-icons text-sm">group_add</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
