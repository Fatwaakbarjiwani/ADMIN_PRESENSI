import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchShifts,
  createShift,
  deleteShift,
  updateShift,
} from "../../redux/actions/shiftAction";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";
import { setUnitId } from "../../redux/reducers/shiftReducer";

function ActionButton({ onClick, title, icon, color }) {
  const colorClass =
    color === "emerald"
      ? "text-emerald-600 focus:text-white focus:bg-emerald-800 hover:ring-emerald-500"
      : color === "red"
      ? "text-red-500 hover:bg-red-50 focus:ring-red-200"
      : "text-yellow-500 hover:bg-yellow-50 focus:ring-yellow-200";
  return (
    <button
      className={`w-8 h-8 flex items-center justify-center rounded-full border border-transparent focus:outline-none focus:ring-2 ${colorClass} transition`}
      onClick={onClick}
      title={title}
      type="button"
      tabIndex={0}
    >
      <span className="material-icons text-base">{icon}</span>
    </button>
  );
}

ActionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AturShift() {
  const dispatch = useDispatch();
  const { data: shifts, loading } = useSelector((state) => state.shift);
  const { user } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState(null);
  const [newShift, setNewShift] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();
  const [unit, setUnit] = useState("");
  const units = useSelector((state) => state.unitDetail.units);

  useEffect(() => {
    if (user !== null || loading == false) {
      dispatch(fetchShifts());
      dispatch(fetchAllUnit());
    }
  }, [dispatch, loading, user]);

  const handleAdd = () => {
    if (!newShift.trim()) return;
    dispatch(
      createShift(
        newShift,
        () => {
          setNewShift("");
        },
        user?.role,
        unit
      )
    );
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white text-lg">schedule</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Manajemen Shift
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Kelola data shift pegawai dan dosen
          </div>
        </div>
      </div>
      <div className="mx-auto p-6 max-w-full flex flex-col gap-6">
        {/* Main Content Card */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          {/* Card Header */}
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-lg text-emerald-600">
                  table_chart
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wide">
                  Data Shift
                </h2>
                <p className="text-emerald-100 text-xs font-medium">
                  Kelola shift pegawai dan dosen
                </p>
              </div>
            </div>
          </div>
          {/* Form Section */}
          <div className="p-4 border-b-2 border-emerald-200">
            {user?.role === "super_admin" ? (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1 block">
                    Nama Shift
                  </label>
                  <input
                    className="w-full px-3 py-2 border-2 border-emerald-300 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white placeholder-gray-500"
                    placeholder="Masukkan nama shift..."
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1 block">
                    Unit
                  </label>
                  <select
                    className="w-full px-3 py-2 border-2 border-emerald-300 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                  >
                    <option value="">Pilih Unit</option>
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
                <div className="flex items-end">
                  <button
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-2 border-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1"
                    onClick={handleAdd}
                  >
                    <span className="material-icons text-sm">add</span>
                    Tambah
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1 block">
                    Nama Shift
                  </label>
                  <input
                    className="w-full px-3 py-2 border-2 border-emerald-300 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white placeholder-gray-500"
                    placeholder="Masukkan nama shift..."
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs border-2 border-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1"
                    onClick={handleAdd}
                  >
                    <span className="material-icons text-sm">add</span>
                    Tambah
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white">
              <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                <tr>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                    No
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                    Nama Shift
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                    Unit
                  </th>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-emerald-600 font-bold"
                    >
                      Memuat data shift...
                    </td>
                  </tr>
                ) : shifts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-400 italic"
                    >
                      Belum ada shift.
                    </td>
                  </tr>
                ) : (
                  shifts.map((shift, i) => (
                    <tr
                      key={shift.id}
                      className={
                        (selected?.id === shift.id ? "bg-emerald-25 " : "") +
                        "transition hover:bg-emerald-50 cursor-pointer border-b border-emerald-100"
                      }
                      onClick={() => setSelected(shift)}
                    >
                      <td className="px-3 py-2 text-center text-sm font-semibold">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {editId === shift.id ? (
                          <input
                            className="border-2 border-emerald-300 px-2 py-1 text-sm w-full focus:border-emerald-500 focus:outline-none"
                            value={editName}
                            autoFocus
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                dispatch(
                                  updateShift(shift.id, editName, () =>
                                    setEditId(null)
                                  )
                                );
                              } else if (e.key === "Escape") {
                                setEditId(null);
                              }
                            }}
                            onBlur={() => setEditId(null)}
                          />
                        ) : (
                          <span className="font-bold text-emerald-800">
                            {shift.name}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm font-bold text-emerald-700">
                        {shift.unit_name}
                      </td>
                      <td className="px-3 py-2 flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditId(shift.id);
                            setEditName(shift.name);
                          }}
                          className="w-8 h-8 flex items-center justify-center text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300 transition-all duration-200"
                          title="Edit Shift"
                        >
                          <span className="material-icons text-sm">edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            Swal.fire({
                              title: "Yakin hapus shift ini?",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonColor: "#d33",
                              cancelButtonColor: "#3085d6",
                              confirmButtonText: "Ya, Hapus",
                              cancelButtonText: "Batal",
                            }).then((result) => {
                              if (result.isConfirmed) {
                                dispatch(deleteShift(shift.id));
                              }
                            });
                          }}
                          className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all duration-200"
                          title="Hapus Shift"
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
                        {shift.shift_detail && shift.shift_detail.id ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/shift-detail/${shift.id}`);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 transition-all duration-200"
                              title="Edit Detail"
                            >
                              <span className="material-icons text-sm">
                                tune
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch(setUnitId(shift.unit_id));
                                navigate(
                                  `/tambah-karyawan-ke-shift/${shift?.shift_detail?.id}`
                                );
                              }}
                              className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 transition-all duration-200"
                              title="Tambah Karyawan ke Shift"
                            >
                              <span className="material-icons text-sm">
                                person_add
                              </span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/shift-detail/${shift.id}`);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 transition-all duration-200"
                            title="Buat Detail"
                          >
                            <span className="material-icons text-sm">add</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Info (bawah) */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          {/* Panel Header */}
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-lg text-emerald-600">
                  info
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wide">
                  Panel Info Shift
                </h2>
                <p className="text-emerald-100 text-xs font-medium">
                  Lihat detail dan ringkasan shift yang dipilih
                </p>
              </div>
            </div>
          </div>
          <div className="p-8 flex flex-col items-center justify-center transition-all duration-300 w-full">
            {selected ? (
              <div className="w-full flex flex-col items-center justify-center animate-fade-in">
                {/* Ringkasan shift */}
                <div className="w-full max-w-2xl bg-emerald-50 border-2 border-emerald-200 p-6 mb-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 p-3 border-2 border-emerald-700">
                      <span className="material-icons text-white text-4xl">
                        event_available
                      </span>
                    </div>
                    <div>
                      <div className="text-emerald-800 font-black text-2xl tracking-wide mb-1">
                        {selected.name}
                      </div>
                      <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider">
                        ID:{" "}
                        <span className="font-mono text-emerald-700">
                          {selected.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-emerald-700 font-bold">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-emerald-600 text-base">
                        business
                      </span>
                      Unit:{" "}
                      <span className="font-mono text-emerald-800">
                        {selected.unit_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-emerald-600 text-base">
                        location_on
                      </span>
                      Unit Detail:{" "}
                      <span className="font-mono text-emerald-800">
                        {selected.unit_detail_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-emerald-600 text-base">
                        calendar_month
                      </span>
                      Dibuat:{" "}
                      <span className="font-mono text-emerald-800">
                        {formatDateTime(selected.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-emerald-600 text-base">
                        update
                      </span>
                      Update:{" "}
                      <span className="font-mono text-emerald-800">
                        {formatDateTime(selected.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Card detail shift */}
                {selected.shift_detail && (
                  <div className="w-full max-w-2xl bg-white border-2 border-emerald-200 p-6 mb-4 shadow-lg">
                    <div className="font-black text-emerald-800 mb-3 flex items-center gap-2 text-lg">
                      <span className="material-icons text-emerald-600 text-xl">
                        schedule
                      </span>
                      Detail Shift
                    </div>
                    <div className="mb-2 text-xs text-emerald-700 font-bold uppercase tracking-wider">
                      Jam Kerja per Hari
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 mb-4">
                      {[
                        "senin",
                        "selasa",
                        "rabu",
                        "kamis",
                        "jumat",
                        "sabtu",
                        "minggu",
                      ].map((hari) => (
                        <div key={hari} className="flex items-center gap-2">
                          <span className="capitalize w-16 font-semibold text-gray-700">
                            {hari}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 font-mono border ${
                              selected.shift_detail[`${hari}_masuk`] === "libur"
                                ? "bg-red-100 text-red-500 border-red-200"
                                : "bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {selected.shift_detail[`${hari}_masuk`] || "-"}
                          </span>
                          <span className="text-xs">-</span>
                          <span
                            className={`text-xs px-2 py-0.5 font-mono border ${
                              selected.shift_detail[`${hari}_pulang`] ===
                              "libur"
                                ? "bg-red-100 text-red-500 border-red-200"
                                : "bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {selected.shift_detail[`${hari}_pulang`] || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700">
                          Toleransi Terlambat
                        </span>
                        <span className="text-xs bg-emerald-100 border border-emerald-200 px-2 py-0.5 font-mono">
                          {selected.shift_detail.toleransi_terlambat ?? "-"}{" "}
                          menit
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700">
                          Toleransi Pulang
                        </span>
                        <span className="text-xs bg-emerald-100 border border-emerald-200 px-2 py-0.5 font-mono">
                          {selected.shift_detail.toleransi_pulang ?? "-"} menit
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-2 text-emerald-700 text-center max-w-md bg-emerald-50 border-2 border-emerald-200 p-3 text-sm flex items-center gap-2 mx-auto">
                  <span className="material-icons text-emerald-600 text-base">
                    info
                  </span>
                  Silakan atur detail shift ini melalui menu pengaturan atau
                  lakukan perubahan sesuai kebutuhan administrasi.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mb-4">
                  <span className="material-icons text-emerald-400 text-2xl">
                    event_busy
                  </span>
                </div>
                <div className="text-emerald-800 font-black text-xl mb-1">
                  Tidak Ada Data Terseleksi
                </div>
                <div className="text-emerald-600 text-center max-w-xs text-sm">
                  Silakan pilih salah satu shift di atas untuk melihat detail
                  informasi.
                </div>
              </div>
            )}
          </div>
        </div>
        <style>{`
          .animate-fade-in { animation: fadeIn 0.5s; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
}
