import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw"; // WAJIB, bukan hanya leaflet-draw/dist/leaflet.draw.css
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchUnitDetailByUserId,
  fetchUnitDetails,
  createUnitDetailV2,
  deleteUnitDetail,
  fetchAllUnit,
  createUnitDetailV1,
} from "../../redux/actions/unitDetailAction";
import axios from "axios";

const kampusCenter = [-6.954089024622504, 110.45883246944116];

export default function AturLokasi() {
  const mapRef = useRef(null);
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "" });
  const [editLoading, setEditLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const drawnItemsRef = useRef();

  // Ambil data unit detail dari redux
  const unitDetails = useSelector((state) => state.unitDetail.data);
  const units = useSelector((state) => state.unitDetail.units);
  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    if (isSuperAdmin && editLoading == false) {
      dispatch(fetchUnitDetails());
      dispatch(fetchAllUnit());
    }
    if (user?.role !== "super_admin" && editLoading == false) {
      dispatch(fetchUnitDetailByUserId(user?.id));
    }
  }, [dispatch, isSuperAdmin, user, editLoading]);

  const handleCreate = () => {
    if (
      !form.name.trim() ||
      polygonCoords.length === 0 ||
      (isSuperAdmin && !form.unit_id)
    ) {
      Swal.fire({
        icon: "error",
        title: isSuperAdmin
          ? "Pilih unit, lengkapi nama detail dan gambar area!"
          : "Lengkapi nama detail dan gambar area!",
      });
      return;
    }
    setEditLoading(true);
    if (isSuperAdmin) {
      // Super admin: kirim unit_id

      dispatch(
        createUnitDetailV1(
          { name: form.name, lokasi: polygonCoords, unit_id: form.unit_id },
          () => {
            setForm({ name: "", unit_id: "" });
            setPolygonCoords([]);
          }
        )
      ).finally(() => setEditLoading(false));
    } else {
      // Admin unit: tanpa unit_id
      dispatch(
        createUnitDetailV2(form.name, polygonCoords, () => {
          setForm({ name: "" });
          setPolygonCoords([]);
        })
      ).finally(() => setEditLoading(false));
    }
  };

  const handleDelete = (id) => {
    setEditLoading(true);
    Swal.fire({
      title: "Yakin hapus unit detail ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteUnitDetail(id)).finally(() => setEditLoading(false));
      }
    });
  };

  // Handler untuk mulai edit
  const handleStartEdit = async (id) => {
    setEditLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/unit-detail/get-by-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res.data;
      setEditId(id);
      setEditForm({ name: data.name });
      setPolygonCoords(data.lokasi || []); // tampilkan di map
    } catch {
      Swal.fire({ icon: "error", title: "Gagal mengambil data unit detail" });
    }
    setEditLoading(false);
  };

  // Handler submit edit
  const handleEdit = async () => {
    if (!editForm.name.trim() || polygonCoords.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Lengkapi nama detail dan gambar area!",
      });
      return;
    }
    setEditLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/unit-detail/update/${editId}`,
        {
          name: editForm.name,
          lokasi: polygonCoords,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditId(null);
      setEditForm({ name: "" });
      setPolygonCoords([]);
      if (isSuperAdmin) {
        dispatch(fetchUnitDetails());
      } else {
        dispatch(fetchUnitDetailByUserId(user?.id));
      }
      Swal.fire({ icon: "success", title: "Unit detail berhasil diupdate" });
    } catch {
      Swal.fire({ icon: "error", title: "Gagal update unit detail" });
    }
    setEditLoading(false);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Prevent double-initialization
    if (mapRef.current._leaflet_map) {
      mapRef.current._leaflet_map.remove();
      mapRef.current._leaflet_map = null;
    }

    const map = L.map(mapRef.current).setView(kampusCenter, 17);
    if (mapRef.current) {
      mapRef.current._leaflet_map = map;
    }

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Tambahkan search control
    L.Control.geocoder({
      defaultMarkGeocode: true,
    })
      .on("markgeocode", function (e) {
        map.setView(e.geocode.center, 18);
      })
      .addTo(map);

    // Tambahkan feature group untuk hasil gambar
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Tambahkan draw control
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.2,
          },
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });
    map.addControl(drawControl);

    // Handler saat polygon baru dibuat
    map.on(L.Draw.Event.CREATED, function (e) {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);
      updatePolygonCoords();
    });

    // Handler saat polygon diedit
    map.on(L.Draw.Event.EDITED, function () {
      updatePolygonCoords();
    });

    // Handler saat polygon dihapus
    map.on(L.Draw.Event.DELETED, function () {
      setPolygonCoords([]);
    });

    // Fungsi untuk update koordinat dari semua polygon di drawnItems
    function updatePolygonCoords() {
      const layers = drawnItems.getLayers();
      if (layers.length > 0) {
        // Ambil hanya polygon pertama (atau sesuaikan jika ingin multi-polygon)
        const layer = layers[0];
        let latlngs = layer
          .getLatLngs()[0]
          .map((latlng) => [latlng.lat, latlng.lng]);
        // Hapus titik duplikat jika ada
        if (
          latlngs.length > 1 &&
          latlngs[0][0] === latlngs[latlngs.length - 1][0] &&
          latlngs[0][1] === latlngs[latlngs.length - 1][1]
        ) {
          latlngs = latlngs.slice(0, -1);
        }
        setPolygonCoords(latlngs);
      } else {
        setPolygonCoords([]);
      }
    }

    // Clean up map on unmount or when showCreate becomes false
    return () => {
      if (mapRef.current && mapRef.current._leaflet_map) {
        mapRef.current._leaflet_map.remove();
        mapRef.current._leaflet_map = null;
      }
    };
  }, []);

  // Tambahkan efek untuk render polygon saat edit
  useEffect(() => {
    if (
      !editId ||
      !polygonCoords.length ||
      !mapRef.current ||
      !drawnItemsRef.current
    )
      return;
    const map = mapRef.current._leaflet_map;
    const drawnItems = drawnItemsRef.current;
    drawnItems.clearLayers();
    const polygon = L.polygon(polygonCoords, {
      color: "#10b981",
      fillColor: "#10b981",
      fillOpacity: 0.2,
    });
    drawnItems.addLayer(polygon);
    map.fitBounds(polygon.getBounds());
  }, [editId, polygonCoords]);

  // Bersihkan polygon di peta saat batal edit
  useEffect(() => {
    if (!editId && drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
  }, [editId]);

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-50 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          add_location_alt
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Atur Lokasi Unit Detail
          </div>
          <div className="text-gray-600 text-base font-medium">
            Kelola area lokasi presensi per unit detail
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl p-4 flex flex-col gap-8 px-2 md:px-0">
        <div className="flex flex-col md:flex-row  items-start gap-8">
          {/* Kiri: Daftar unit detail */}
          <div className="flex-1">
            <div className="font-bold text-emerald-700 text-lg mb-2">
              DAFTAR UNIT DETAIL
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unitDetails.map((u) => (
                <div
                  key={u.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-md p-2 flex flex-col gap-2 min-h-[140px] transition hover:shadow-lg hover:border-emerald-400"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-emerald-400 text-2xl">
                          apartment
                        </span>
                        <span className="font-bold text-lg text-emerald-700">
                          {u.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <span className="material-icons text-emerald-400 text-base">
                          location_on
                        </span>
                        <span>{u.name}</span>
                      </div>
                    </div>
                    <div>
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-full transition hover:bg-slate-100 focus:bg-slate-200"
                        onClick={() => handleStartEdit(u.id)}
                        disabled={editLoading && editId === u.id}
                        title="Edit"
                      >
                        {editLoading && editId === u.id ? (
                          <span className="animate-spin inline-block align-middle">
                            <svg
                              className="w-5 h-5 text-yellow-500"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              ></path>
                            </svg>
                          </span>
                        ) : (
                          <span className="material-icons text-yellow-500 text-xl">
                            edit
                          </span>
                        )}
                      </button>
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-full transition hover:bg-slate-100 focus:bg-slate-200"
                        onClick={() => handleDelete(u.id)}
                        title="Hapus"
                      >
                        <span className="material-icons text-red-500 text-xl">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-2 text-xs text-gray-500">
                    <div>
                      Created:{" "}
                      {new Date(u.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div>
                      Updated:{" "}
                      {new Date(u.updated_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Kanan: Form create/edit unit detail */}
          <div className="flex-1 sticky top-24">
            <div className="font-bold text-emerald-700 text-lg mb-2">
              {editId ? "EDIT UNIT DETAIL" : "TAMBAH UNIT DETAIL"}
            </div>
            <div className="mb-2">
              {isSuperAdmin && !editId && (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                  value={form.unit_id || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit_id: e.target.value }))
                  }
                  disabled={editLoading}
                >
                  <option value="">Pilih Unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                placeholder="Nama Unit Detail"
                value={editId ? editForm.name : form.name}
                onChange={(e) =>
                  editId
                    ? setEditForm((f) => ({ ...f, name: e.target.value }))
                    : setForm((f) => ({ ...f, name: e.target.value }))
                }
                disabled={editLoading}
              />
              {/* Map tetap di sini, polygonCoords tetap dipakai untuk create/edit */}
              <div
                ref={mapRef}
                className="w-full h-64 rounded border border-emerald-200 mb-2"
              />
              <button
                className={`px-4 py-2 ${
                  editId
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } text-white font-bold rounded w-full`}
                onClick={editId ? handleEdit : handleCreate}
                disabled={editLoading}
              >
                {editId
                  ? editLoading
                    ? "Menyimpan..."
                    : "Simpan Perubahan"
                  : "Tambah Unit Detail"}
              </button>
              {editId && (
                <button
                  className="mt-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold rounded w-full"
                  onClick={() => {
                    setEditId(null);
                    setEditForm({ name: "" });
                    setPolygonCoords([]);
                  }}
                  // disabled={editLoading}
                >
                  Batal Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
