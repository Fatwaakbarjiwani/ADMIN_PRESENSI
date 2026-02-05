import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventDetail, fetchPegawaiByEvent, addPegawaiToEvent, removePegawaiFromEvent } from "../../redux/actions/presensiAction";
import { fetchPegawai2 } from "../../redux/actions/pegawaiAction";
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";
import Swal from "sweetalert2";

export default function EventPegawai() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const eventDetail = useSelector((state) => state.presensi.eventDetail);
  const eventDetailLoading = useSelector((state) => state.presensi.eventDetailLoading);
  const eventPegawai = useSelector((state) => state.presensi.eventPegawai);
  const eventPegawaiLoading = useSelector((state) => state.presensi.eventPegawaiLoading);
  const pegawaiData = useSelector((state) => state.pegawai.data);
  const { pagination } = useSelector((state) => state.pegawai);
  const pegawaiLoading = useSelector((state) => state.pegawai.loading);
  const units = useSelector((state) => state.unitDetail.units);

  const isSuperAdmin = user?.role === "super_admin";
  const eventUnitId = eventDetail?.ms_unit_id ? String(eventDetail.ms_unit_id) : "";
  const [selectedUnit, setSelectedUnit] = useState("");
  const [searchPegawai, setSearchPegawai] = useState("");
  const [pegawaiIdsToAdd, setPegawaiIdsToAdd] = useState([]);
  const [pegawaiIdsToRemove, setPegawaiIdsToRemove] = useState([]);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchEventDetail(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (id) dispatch(fetchPegawaiByEvent(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isSuperAdmin) dispatch(fetchAllUnit());
  }, [dispatch, isSuperAdmin]);

  const unitForPegawai = isSuperAdmin ? (selectedUnit || eventUnitId) : null;
  useEffect(() => {
    if (token) {
      dispatch(fetchPegawai2(isSuperAdmin, token, 1, searchPegawai, unitForPegawai || undefined));
    }
  }, [token, dispatch, isSuperAdmin, searchPegawai, unitForPegawai]);

  const pegawaiList = Array.isArray(pegawaiData?.data)
    ? pegawaiData.data
    : Array.isArray(pegawaiData)
    ? pegawaiData
    : [];

  const pegawaiInEvent = Array.isArray(eventPegawai) ? eventPegawai : [];
  const getPegawaiId = (p) => {
    if (!p || typeof p !== "object") return p;
    return p.pegawai_id ?? p.pegawai?.id ?? p.id;
  };
  const getPegawaiDisplay = (p) => {
    if (!p || typeof p !== "object") return p;
    return p.pegawai ?? p;
  };
  const pegawaiInEventIds = pegawaiInEvent.map(getPegawaiId);

  const handlePageChange = (page) => {
    dispatch(fetchPegawai2(isSuperAdmin, token, page, searchPegawai, unitForPegawai || undefined));
  };

  const handleToggleAdd = (pegawaiId) => {
    setPegawaiIdsToAdd((prev) =>
      prev.includes(pegawaiId) ? prev.filter((id) => id !== pegawaiId) : [...prev, pegawaiId]
    );
  };

  const handleSelectAllAdd = (checked) => {
    if (checked) {
      const ids = pegawaiList.map((p) => p.id).filter((id) => !pegawaiInEventIds.includes(id));
      setPegawaiIdsToAdd(ids);
    } else {
      setPegawaiIdsToAdd([]);
    }
  };

  const handleToggleRemove = (pegawaiId) => {
    setPegawaiIdsToRemove((prev) =>
      prev.includes(pegawaiId) ? prev.filter((id) => id !== pegawaiId) : [...prev, pegawaiId]
    );
  };

  const handleSelectAllRemove = (checked) => {
    if (checked) {
      setPegawaiIdsToRemove([...pegawaiInEventIds]);
    } else {
      setPegawaiIdsToRemove([]);
    }
  };

  const handleAddToEvent = async () => {
    if (pegawaiIdsToAdd.length === 0) {
      Swal.fire("Validasi", "Pilih minimal satu pegawai untuk ditambahkan", "warning");
      return;
    }
    setAdding(true);
    const result = await dispatch(addPegawaiToEvent(Number(id), pegawaiIdsToAdd));
    setAdding(false);
    if (result?.success) {
      Swal.fire({ icon: "success", title: "Pegawai berhasil ditambahkan ke event", timer: 1500, showConfirmButton: false });
      setPegawaiIdsToAdd([]);
      dispatch(fetchPegawaiByEvent(id));
    } else {
      Swal.fire("Error", result?.message ?? "Gagal menambah pegawai ke event", "error");
    }
  };

  const handleRemoveFromEvent = async () => {
    if (pegawaiIdsToRemove.length === 0) {
      Swal.fire("Validasi", "Pilih minimal satu pegawai untuk dihapus dari event", "warning");
      return;
    }
    setRemoving(true);
    const result = await dispatch(removePegawaiFromEvent(Number(id), pegawaiIdsToRemove));
    setRemoving(false);
    if (result?.success) {
      Swal.fire({ icon: "success", title: "Pegawai berhasil dihapus dari event", timer: 1500, showConfirmButton: false });
      setPegawaiIdsToRemove([]);
      dispatch(fetchPegawaiByEvent(id));
    } else {
      Swal.fire("Error", result?.message ?? "Gagal menghapus pegawai dari event", "error");
    }
  };

  const getNamaPegawai = (p) => {
    const display = getPegawaiDisplay(p);
    if (!display) return "-";
    if (typeof display === "object") {
      const fallback = [display.gelar_depan, display.nama, display.gelar_belakang].filter(Boolean).join(" ") || display.nama || "-";
      return display.nama_lengkap ?? fallback;
    }
    return String(display);
  };

  const allSelectedAdd =
    pegawaiList.length > 0 &&
    pegawaiList.filter((p) => !pegawaiInEventIds.includes(p.id)).length > 0 &&
    pegawaiList.every((p) => pegawaiInEventIds.includes(p.id) || pegawaiIdsToAdd.includes(p.id));

  if (eventDetailLoading && !eventDetail) {
    return (
      <div className="w-full min-h-screen font-sans bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons animate-spin text-4xl text-emerald-600">refresh</span>
          <p className="text-emerald-700 font-bold mt-2">Memuat data event...</p>
        </div>
      </div>
    );
  }

  if (!eventDetail || eventDetail.id !== Number(id)) {
    return (
      <div className="w-full min-h-screen font-sans bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Event tidak ditemukan</p>
          <button
            type="button"
            onClick={() => navigate("/event")}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold hover:bg-emerald-700"
          >
            Kembali ke Daftar Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/event/${id}`)}
          className="p-2 hover:bg-gray-100 transition"
        >
          <span className="material-icons text-gray-600">arrow_back</span>
        </button>
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white">group_add</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-800 tracking-tight uppercase">
            Pegawai Event
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            {eventDetail.nama_event ?? "Event"} — Tambah / Hapus pegawai
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-6xl flex flex-col gap-6">
        {isSuperAdmin && (
          <div className="bg-white border-2 border-emerald-200 shadow-lg p-4">
            <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
              Filter Unit (untuk daftar pegawai)
            </label>
            <select
              value={selectedUnit || eventUnitId}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="">Semua Unit</option>
              {Array.isArray(units) &&
                units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u?.nama ?? u?.name ?? u.id}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Tambah pegawai ke event */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-emerald-600">person_add</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Tambah Pegawai ke Event
                </h3>
                <p className="text-emerald-100 text-xs font-medium">
                  Pilih pegawai lalu klik Tambah ke Event
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Cari pegawai..."
                value={searchPegawai}
                onChange={(e) => setSearchPegawai(e.target.value)}
                className="w-full max-w-md px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            {pegawaiIdsToAdd.length > 0 && (
              <div className="mb-4 p-3 bg-emerald-50 border-2 border-emerald-200">
                <span className="text-sm text-emerald-800 font-bold">
                  Terpilih untuk ditambahkan: {pegawaiIdsToAdd.length} pegawai
                </span>
                <button
                  type="button"
                  onClick={handleAddToEvent}
                  disabled={adding}
                  className="ml-4 px-4 py-2 bg-emerald-600 text-white font-bold border-2 border-emerald-700 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {adding ? "Memproses..." : "Tambah ke Event"}
                </button>
              </div>
            )}
            {pegawaiLoading ? (
              <div className="py-8 text-center text-emerald-600">
                <span className="material-icons animate-spin text-2xl">refresh</span>
                <p className="mt-2">Memuat data pegawai...</p>
              </div>
            ) : (
              <div className="border-2 border-emerald-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 uppercase w-12">
                        <input
                          type="checkbox"
                          checked={allSelectedAdd}
                          onChange={(e) => handleSelectAllAdd(e.target.checked)}
                          className="w-4 h-4 text-emerald-600"
                        />
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 uppercase">Nama</th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 uppercase">NIK</th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 uppercase">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pegawaiList.length > 0 ? (
                      pegawaiList.map((p) => {
                        const alreadyInEvent = pegawaiInEventIds.includes(p.id);
                        return (
                          <tr
                            key={p.id}
                            className={`border-b border-emerald-100 hover:bg-emerald-50 ${
                              alreadyInEvent ? "opacity-60 bg-gray-50" : ""
                            }`}
                          >
                            <td className="px-3 py-2">
                              {!alreadyInEvent && (
                                <input
                                  type="checkbox"
                                  checked={pegawaiIdsToAdd.includes(p.id)}
                                  onChange={() => handleToggleAdd(p.id)}
                                  className="w-4 h-4 text-emerald-600"
                                />
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {[p.gelar_depan, p.nama, p.gelar_belakang].filter(Boolean).join(" ")}
                            </td>
                            <td className="px-3 py-2">{p.no_ktp ?? "-"}</td>
                            <td className="px-3 py-2">{p.nama_unit ?? "-"}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                          Tidak ada data pegawai
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {pagination?.last_page > 1 && (
                  <div className="flex flex-wrap gap-1 justify-center p-4">
                    {pagination.links?.map((link, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`px-3 py-1 text-xs font-bold border ${
                          link.active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-100"
                        }`}
                        onClick={() => link.url && handlePageChange(Number(new URL(link.url).searchParams.get("page")))}
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

        {/* Pegawai dalam event - Hapus dari event */}
        <div className="bg-white border-2 border-amber-200 shadow-lg overflow-hidden">
          <div className="bg-amber-600 px-4 py-3 border-b-2 border-amber-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-amber-600">person_remove</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Pegawai dalam Event
                </h3>
                <p className="text-amber-100 text-xs font-medium">
                  Pilih pegawai lalu klik Hapus dari Event
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {eventPegawaiLoading ? (
              <div className="py-8 text-center text-amber-600">
                <span className="material-icons animate-spin text-2xl">refresh</span>
                <p className="mt-2">Memuat pegawai dalam event...</p>
              </div>
            ) : pegawaiInEventIds.length === 0 ? (
              <p className="text-gray-500 py-4">
                Belum ada pegawai dalam event ini. Tambah pegawai di atas.
              </p>
            ) : (
              <>
                {pegawaiIdsToRemove.length > 0 && (
                  <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-200">
                    <span className="text-sm text-amber-800 font-bold">
                      Terpilih untuk dihapus: {pegawaiIdsToRemove.length} pegawai
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveFromEvent}
                      disabled={removing}
                      className="ml-4 px-4 py-2 bg-amber-600 text-white font-bold border-2 border-amber-700 hover:bg-amber-700 disabled:opacity-50"
                    >
                      {removing ? "Memproses..." : "Hapus dari Event"}
                    </button>
                  </div>
                )}
                <div className="border-2 border-amber-200 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-amber-50 border-b-2 border-amber-200">
                      <tr>
                        <th className="px-3 py-2 text-left font-black text-amber-800 uppercase w-12">
                          <input
                            type="checkbox"
                            checked={
                              pegawaiInEventIds.length > 0 &&
                              pegawaiInEventIds.every((id) => pegawaiIdsToRemove.includes(id))
                            }
                            onChange={(e) => handleSelectAllRemove(e.target.checked)}
                            className="w-4 h-4 text-amber-600"
                          />
                        </th>
                        <th className="px-3 py-2 text-left font-black text-amber-800 uppercase">Nama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pegawaiInEvent.map((p) => {
                        const pid = typeof p === "object" ? p.id : p;
                        return (
                          <tr key={pid} className="border-b border-amber-100 hover:bg-amber-50">
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                checked={pegawaiIdsToRemove.includes(pid)}
                                onChange={() => handleToggleRemove(pid)}
                                className="w-4 h-4 text-amber-600"
                              />
                            </td>
                            <td className="px-3 py-2">{getNamaPegawai(p)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/event/${id}`)}
            className="px-4 py-2 border-2 border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-50"
          >
            Kembali ke Detail Event
          </button>
        </div>
      </div>
    </div>
  );
}
