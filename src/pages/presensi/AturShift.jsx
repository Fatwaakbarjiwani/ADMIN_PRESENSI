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
  const { data: shifts, loading, error } = useSelector((state) => state.shift);
  const { user } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState(null);
  const [newShift, setNewShift] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user && loading == false) {
      dispatch(fetchShifts());
    }
  }, [dispatch, loading, user]);

  const handleAdd = () => {
    if (!newShift.trim()) return;
    dispatch(
      createShift(newShift, () => {
        setNewShift("");
      })
    );
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-50 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          {"dashboard"}
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Shifts Scheduling
          </div>
          <div className="text-gray-600 text-base font-medium">
            Atur dan kelola shift pegawai/dosen dengan mudah.
          </div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        {/* Data Shift (atas) */}
        <div className="border border-gray-300 bg-white p-4 mb-2 w-full">
          <div className="font-bold text-primary mb-4 text-lg flex items-center gap-2 tracking-wide">
            <span className="material-icons text-primary text-xl">
              table_chart
            </span>
            DATA SHIFT
          </div>
          <div>
            {/* Form tambah shift hanya di sini, di atas tabel */}
            <div className="flex gap-2 mb-4">
              <input
                className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-900 bg-white text-sm shadow-none"
                placeholder="Nama Shift"
                value={newShift}
                onChange={(e) => setNewShift(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <button
                className="px-4 py-2 border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all duration-200"
                onClick={handleAdd}
              >
                Tambah
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-md overflow-hidden shadow-sm bg-white">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-3 py-2 border-b text-left font-bold text-emerald-700">
                      No
                    </th>
                    <th className="px-3 py-2 border-b text-left font-bold text-emerald-700">
                      Nama Shift
                    </th>
                    <th className="px-3 py-2 border-b text-left font-bold text-emerald-700">
                      Unit
                    </th>
                    <th className="px-3 py-2 border-b text-left font-bold text-emerald-700">
                      Unit Detail
                    </th>
                    <th className="px-3 py-2 border-b text-center font-bold text-emerald-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-emerald-600 font-bold"
                      >
                        Memuat data shift...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-red-600 font-bold"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : shifts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
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
                          selected?.id === shift.id
                            ? "bg-emerald-50/40"
                            : "hover:bg-emerald-50/20 cursor-pointer"
                        }
                        onClick={() => setSelected(shift)}
                      >
                        <td className="px-3 py-2 border-b text-left align-middle">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2 border-b align-middle">
                          {editId === shift.id ? (
                            <input
                              className="border border-emerald-300 rounded px-2 py-1 text-sm w-full"
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
                            <span className="font-semibold text-emerald-700">
                              {shift.name}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 border-b align-middle text-gray-700">
                          {shift.unit_name}
                        </td>
                        <td className="px-3 py-2 border-b align-middle text-gray-700">
                          {shift.unit_detail_name}
                        </td>
                        <td className="px-3 py-2 flex items-center justify-center border-b align-middle text-center gap-1">
                          <ActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditId(shift.id);
                              setEditName(shift.name);
                            }}
                            title="Edit Shift"
                            icon="edit"
                            color="yellow"
                          />
                          <ActionButton
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(deleteShift(shift.id));
                            }}
                            title="Hapus Shift"
                            icon="delete"
                            color="red"
                          />
                          {shift.shift_detail && shift.shift_detail.id ? (
                            <ActionButton
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/shift-detail/${shift.id}`
                                );
                              }}
                              title="Edit Detail"
                              icon="tune"
                              color="emerald"
                            />
                          ) : (
                            <ActionButton
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/shift-detail/${shift.id}`);
                              }}
                              title="Buat Detail"
                              icon="add"
                              color="emerald"
                            />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Panel Info (bawah) */}
        <div className="border border-gray-300 bg-white p-8 flex flex-col items-center justify-center transition-all duration-300 w-full">
          <div className="font-bold text-primary text-lg w-full text-left tracking-wide flex items-center gap-2">
            <span className="material-icons text-primary text-xl">info</span>
            PANEL INFO
          </div>
          {selected ? (
            <div className="w-full flex flex-col items-center justify-center animate-fade-in">
              <div className="flex items-center gap-4 mb-4">
                <span className="material-icons text-white bg-gradient-to-tr from-emerald-400 to-green-600 p-2 rounded-full text-3xl shadow">
                  event_available
                </span>
                <div className="text-emerald-700 font-extrabold text-2xl tracking-wide">
                  {selected.name}
                </div>
              </div>
              <div className="w-full max-w-xl bg-emerald-50/40 rounded-lg p-4 mb-4 shadow-sm border border-emerald-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <span className="material-icons text-emerald-400 text-base">
                      tag
                    </span>
                    <span className="font-bold">ID:</span>
                    <span className="font-mono">{selected.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <span className="material-icons text-emerald-400 text-base">
                      badge
                    </span>
                    <span className="font-bold">Nama Shift:</span>
                    <span>{selected.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <span className="material-icons text-emerald-400 text-base">
                      business
                    </span>
                    <span className="font-bold">Unit:</span>
                    <span className="font-mono">{selected.unit_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <span className="material-icons text-emerald-400 text-base">
                      location_on
                    </span>
                    <span className="font-bold">Unit Detail:</span>
                    <span className="font-mono">
                      {selected.unit_detail_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <span className="material-icons text-emerald-400 text-base">
                      calendar_month
                    </span>
                    <span className="font-bold">Created At:</span>
                    <span className="font-mono">
                      {formatDateTime(selected.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <span className="material-icons text-emerald-400 text-base">
                      update
                    </span>
                    <span className="font-bold">Updated At:</span>
                    <span className="font-mono">
                      {formatDateTime(selected.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
              {selected.shift_detail && (
                <div className="w-full max-w-xl bg-white rounded-lg p-4 mb-4 shadow border border-emerald-100">
                  <div className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                    <span className="material-icons text-emerald-400 text-xl">schedule</span>
                    Detail Shift
                  </div>
                  <div className="mb-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">Jam Kerja per Hari</div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                    {["senin","selasa","rabu","kamis","jumat","sabtu","minggu"].map((hari) => (
                      <div key={hari} className="flex items-center gap-2">
                        <span className="capitalize w-14">{hari}</span>
                        <span className="text-xs">{selected.shift_detail[`${hari}_masuk`] || "-"}</span>
                        <span>-</span>
                        <span className="text-xs">{selected.shift_detail[`${hari}_pulang`] || "-"}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-600">Toleransi Terlambat</span>
                      <span className="text-xs">{selected.shift_detail.toleransi_terlambat ?? "-"} menit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-600">Toleransi Pulang</span>
                      <span className="text-xs">{selected.shift_detail.toleransi_pulang ?? "-"} menit</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-2 text-gray-700 text-center max-w-md">
                Silakan atur detail shift ini melalui menu pengaturan atau
                lakukan perubahan sesuai kebutuhan administrasi.
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full animate-fade-in">
              <span className="material-icons text-emerald-300 text-6xl mb-2">
                event_busy
              </span>
              <div className="text-emerald-700 font-bold text-xl mb-1">
                Tidak Ada Data Terseleksi
              </div>
              <div className="text-gray-500 text-center max-w-xs">
                Silakan pilih salah satu shift di atas untuk melihat detail
                informasi.
              </div>
            </div>
          )}
        </div>
        <style>{`
          .animate-fade-in { animation: fadeIn 0.5s; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
}
