import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { useDispatch, useSelector } from "react-redux";
import { createEvent, fetchEvent } from "../../redux/actions/presensiAction";
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";
import Swal from "sweetalert2";

const kampusCenter = [-6.954089024622504, 110.45883246944116];

const HARI_MINGGUAN_OPTIONS = [
  "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"
];

export default function EventTambah() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const units = useSelector((state) => state.unitDetail.units);
  const isSuperAdmin = user?.role === "super_admin";

  const mapRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const unitIdFromState = location.state?.unitId;
  const [selectedUnit, setSelectedUnit] = useState(unitIdFromState || "");
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [form, setForm] = useState({
    nama_event: "",
    deskripsi: "",
    tipe_event: "Sholat Fardhu",
    tanggal_mulai: "",
    tanggal_selesai: "",
    waktu_mulai: "",
    waktu_selesai: "",
    waktu_masuk_mulai: "",
    waktu_masuk_selesai: "",
    waktu_pulang_mulai: "",
    waktu_pulang_selesai: "",
    hari_mingguan: "",
    nama_tempat: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      dispatch(fetchAllUnit());
    }
    if (unitIdFromState) {
      setSelectedUnit(unitIdFromState);
    }
  }, [dispatch, isSuperAdmin, unitIdFromState]);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    if (mapElement._leaflet_map) return;

    const map = L.map(mapElement).setView(kampusCenter, 17);
    mapElement._leaflet_map = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.Control.geocoder({
      defaultMarkGeocode: true,
    })
      .on("markgeocode", function (e) {
        map.setView(e.geocode.center, 18);
      })
      .addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

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

    function updatePolygonCoords() {
      const layers = drawnItems.getLayers();
      if (layers.length > 0) {
        const allPolygons = layers
          .map((layer) => {
            try {
              const latlngsArray = layer.getLatLngs();
              if (!latlngsArray || !latlngsArray[0]) {
                return null;
              }
              let latlngs = latlngsArray[0].map((ll) => [ll.lat, ll.lng]);
              if (
                latlngs.length > 1 &&
                latlngs[0][0] === latlngs[latlngs.length - 1][0] &&
                latlngs[0][1] === latlngs[latlngs.length - 1][1]
              ) {
                latlngs = latlngs.slice(0, -1);
              }
              return latlngs.length >= 3 ? latlngs : null;
            } catch {
              return null;
            }
          })
          .filter((polygon) => polygon !== null);
        setPolygonCoords(allPolygons);
      } else {
        setPolygonCoords([]);
      }
    }

    map.on(L.Draw.Event.CREATED, function (e) {
      const currentLayers = drawnItems.getLayers();
      if (currentLayers.length >= 3) {
        drawnItems.removeLayer(e.layer);
        Swal.fire({
          icon: "warning",
          title: "Maksimal 3 Polygon",
          text: "Anda hanya dapat membuat maksimal 3 polygon",
        });
        return;
      }

      const colors = [
        { color: "#10b981", fillColor: "#10b981" },
        { color: "#3b82f6", fillColor: "#3b82f6" },
        { color: "#f59e0b", fillColor: "#f59e0b" },
      ];
      const colorIndex = currentLayers.length % colors.length;
      e.layer.setStyle({
        color: colors[colorIndex].color,
        fillColor: colors[colorIndex].fillColor,
        fillOpacity: 0.2,
      });

      const lokasiName = currentLayers.length === 0 ? "Lokasi" : `Lokasi${currentLayers.length + 1}`;
      e.layer.bindPopup(`<b>${lokasiName}</b>`);

      drawnItems.addLayer(e.layer);
      updatePolygonCoords();
    });

    map.on(L.Draw.Event.EDITED, function () {
      updatePolygonCoords();
    });

    map.on(L.Draw.Event.DELETED, function () {
      setTimeout(updatePolygonCoords, 100);
    });

    return () => {
      drawnItemsRef.current = null;
      const mapInstance = mapElement?._leaflet_map;
      if (!mapInstance) return;
      try {
        mapInstance.off();
        mapInstance.remove();
      } catch (error) {
        return error.response.data;
      }
      if (mapElement) mapElement._leaflet_map = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current?._leaflet_map || !drawnItemsRef.current) {
      return;
    }

    const map = mapRef.current._leaflet_map;
    const drawnItems = drawnItemsRef.current;

    drawnItems.clearLayers();

    if (Array.isArray(polygonCoords) && polygonCoords.length > 0) {
      polygonCoords.forEach((coords, index) => {
        if (coords && Array.isArray(coords) && coords.length >= 3) {
          const colors = [
            { color: "#10b981", fillColor: "#10b981" },
            { color: "#3b82f6", fillColor: "#3b82f6" },
            { color: "#f59e0b", fillColor: "#f59e0b" },
          ];
          const colorIndex = index % colors.length;
          const polygon = L.polygon(coords, {
            color: colors[colorIndex].color,
            fillColor: colors[colorIndex].fillColor,
            fillOpacity: 0.2,
          });

          const lokasiName = index === 0 ? "Lokasi" : `Lokasi${index + 1}`;
          polygon.bindPopup(`<b>${lokasiName}</b>`);

          drawnItems.addLayer(polygon);
        }
      });

      if (drawnItems.getLayers().length > 0) {
        const group = new L.featureGroup(drawnItems.getLayers());
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [polygonCoords]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_event?.trim()) {
      Swal.fire("Validasi", "Nama event wajib diisi", "warning");
      return;
    }
    if (isSuperAdmin && !selectedUnit) {
      Swal.fire("Validasi", "Pilih unit untuk super admin", "warning");
      return;
    }

    if (form.tipe_event === "Sholat Fardhu") {
      if (!form.waktu_mulai?.trim() || !form.waktu_selesai?.trim()) {
        Swal.fire("Validasi", "Waktu mulai dan selesai wajib diisi untuk Sholat Fardhu", "warning");
        return;
      }
    } else if (form.tipe_event === "Event & Kegiatan Islam") {
      if (!form.tanggal_mulai?.trim() || !form.tanggal_selesai?.trim()) {
        Swal.fire("Validasi", "Tanggal mulai dan selesai wajib diisi untuk Event & Kegiatan Islam", "warning");
        return;
      }
      if (!form.waktu_masuk_mulai?.trim() || !form.waktu_masuk_selesai?.trim()) {
        Swal.fire("Validasi", "Waktu masuk mulai dan selesai wajib diisi untuk Event & Kegiatan Islam", "warning");
        return;
      }
      if (!form.waktu_pulang_mulai?.trim() || !form.waktu_pulang_selesai?.trim()) {
        Swal.fire("Validasi", "Waktu pulang mulai dan selesai wajib diisi untuk Event & Kegiatan Islam", "warning");
        return;
      }
    }

    setSubmitting(true);
    const payload = {
      nama_event: form.nama_event.trim(),
      deskripsi: form.deskripsi.trim(),
      tipe_event: form.tipe_event,
      nama_tempat: form.nama_tempat.trim(),
    };

    if (isSuperAdmin && selectedUnit) {
      payload.unit_id = parseInt(selectedUnit);
    }

    if (form.tipe_event === "Sholat Fardhu") {
      payload.waktu_mulai = form.waktu_mulai.trim();
      payload.waktu_selesai = form.waktu_selesai.trim();
    } else if (form.tipe_event === "Event & Kegiatan Islam") {
      payload.tanggal_mulai = form.tanggal_mulai.trim();
      payload.tanggal_selesai = form.tanggal_selesai.trim();
      payload.waktu_masuk_mulai = form.waktu_masuk_mulai.trim();
      payload.waktu_masuk_selesai = form.waktu_masuk_selesai.trim();
      payload.waktu_pulang_mulai = form.waktu_pulang_mulai.trim();
      payload.waktu_pulang_selesai = form.waktu_pulang_selesai.trim();
      if (form.hari_mingguan?.trim()) {
        payload.hari_mingguan = form.hari_mingguan.trim();
      }
    }

    if (polygonCoords.length > 0 && polygonCoords[0] && polygonCoords[0].length >= 3) {
      payload.lokasi = polygonCoords[0];
    } else {
      payload.lokasi = "";
    }
    if (polygonCoords.length > 1 && polygonCoords[1] && polygonCoords[1].length >= 3) {
      payload.lokasi2 = polygonCoords[1];
    } else {
      payload.lokasi2 = "";
    }
    if (polygonCoords.length > 2 && polygonCoords[2] && polygonCoords[2].length >= 3) {
      payload.lokasi3 = polygonCoords[2];
    } else {
      payload.lokasi3 = "";
    }

    const result = await dispatch(
      createEvent(payload, isSuperAdmin, selectedUnit || null)
    );
    setSubmitting(false);

    if (result?.success) {
      Swal.fire({
        icon: "success",
        title: "Event berhasil dibuat",
        timer: 1500,
        showConfirmButton: false,
      });
      if (!isSuperAdmin) dispatch(fetchEvent("", null, false, null));
      else if (selectedUnit) dispatch(fetchEvent("", selectedUnit, true, null));
      navigate("/event");
    } else {
      Swal.fire("Error", result?.message ?? "Gagal membuat event", "error");
    }
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/event")}
          className="p-2 hover:bg-gray-100 transition"
        >
          <span className="material-icons text-gray-600">arrow_back</span>
        </button>
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white">event</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Tambah Event
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Tambah data event presensi baru
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-full flex flex-col gap-6">
        <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-emerald-600">edit_calendar</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Form Tambah Event
                </h3>
                <p className="text-emerald-100 text-xs font-medium">
                  Isi form dan gambar polygon lokasi di bawah
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {isSuperAdmin && (
              <div>
                <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                  Unit *
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white"
                  required={isSuperAdmin}
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

            <div>
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Nama Event *
              </label>
              <input
                type="text"
                value={form.nama_event}
                onChange={(e) => setForm((f) => ({ ...f, nama_event: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                placeholder="Contoh: Sholat Jum'at"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Deskripsi
              </label>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                rows={2}
                placeholder="Deskripsi event"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Tipe Event *
              </label>
              <select
                value={form.tipe_event}
                onChange={(e) => setForm((f) => ({ ...f, tipe_event: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white"
              >
                <option value="Sholat Fardhu">Sholat Fardhu</option>
                <option value="Event & Kegiatan Islam">Event & Kegiatan Islam</option>
              </select>
            </div>

            {form.tipe_event === "Sholat Fardhu" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                    Waktu Mulai *
                  </label>
                  <input
                    type="time"
                    value={form.waktu_mulai}
                    onChange={(e) => setForm((f) => ({ ...f, waktu_mulai: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                    Waktu Selesai *
                  </label>
                  <input
                    type="time"
                    value={form.waktu_selesai}
                    onChange={(e) => setForm((f) => ({ ...f, waktu_selesai: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {form.tipe_event === "Event & Kegiatan Islam" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                      Tanggal Mulai *
                    </label>
                    <input
                      type="date"
                      value={form.tanggal_mulai}
                      onChange={(e) => setForm((f) => ({ ...f, tanggal_mulai: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                      Tanggal Selesai *
                    </label>
                    <input
                      type="date"
                      value={form.tanggal_selesai}
                      onChange={(e) => setForm((f) => ({ ...f, tanggal_selesai: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                    Hari Mingguan (Opsional)
                  </label>
                  <select
                    value={form.hari_mingguan}
                    onChange={(e) => setForm((f) => ({ ...f, hari_mingguan: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="">Tidak ada</option>
                    {HARI_MINGGUAN_OPTIONS.map((hari) => (
                      <option key={hari} value={hari}>{hari}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                      Waktu Masuk
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-emerald-600 mb-1">
                          Mulai *
                        </label>
                        <input
                          type="time"
                          value={form.waktu_masuk_mulai}
                          onChange={(e) => setForm((f) => ({ ...f, waktu_masuk_mulai: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-emerald-600 mb-1">
                          Selesai *
                        </label>
                        <input
                          type="time"
                          value={form.waktu_masuk_selesai}
                          onChange={(e) => setForm((f) => ({ ...f, waktu_masuk_selesai: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                      Waktu Pulang
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-emerald-600 mb-1">
                          Mulai *
                        </label>
                        <input
                          type="time"
                          value={form.waktu_pulang_mulai}
                          onChange={(e) => setForm((f) => ({ ...f, waktu_pulang_mulai: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-emerald-600 mb-1">
                          Selesai *
                        </label>
                        <input
                          type="time"
                          value={form.waktu_pulang_selesai}
                          onChange={(e) => setForm((f) => ({ ...f, waktu_pulang_selesai: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Nama Tempat
              </label>
              <input
                type="text"
                value={form.nama_tempat}
                onChange={(e) => setForm((f) => ({ ...f, nama_tempat: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                placeholder="Contoh: Masjid ABA"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Lokasi (Polygon) - Maksimal 3 Lokasi
              </label>
              <p className="text-xs text-emerald-600 mb-2">
                Gambar polygon di peta menggunakan tool draw (ikon pensil). Anda dapat membuat maksimal 3 polygon untuk area lokasi event.
              </p>
              <div
                ref={mapRef}
                className="w-full h-[400px] border-2 border-emerald-200"
                style={{ minHeight: "400px" }}
              />
              {polygonCoords.length > 0 && (
                <div className="mt-2 space-y-1">
                  {polygonCoords.map((polygon, index) => {
                    const colors = [
                      { color: "#10b981", name: "Hijau" },
                      { color: "#3b82f6", name: "Biru" },
                      { color: "#f59e0b", name: "Orange" },
                    ];
                    const colorIndex = index % colors.length;
                    const color = colors[colorIndex];
                    return (
                      <p key={index} className="text-xs text-emerald-700 font-medium flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 border border-gray-300"
                          style={{ backgroundColor: color.color }}
                        ></span>
                        {index === 0 ? "Lokasi Utama" : `Lokasi ${index + 1}`} ({polygon.length} titik) - {color.name}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t-2 border-emerald-200">
              <button
                type="button"
                onClick={() => navigate("/event")}
                className="px-4 py-2 border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold border-2 border-emerald-700 transition-colors flex items-center gap-1"
              >
                {submitting ? (
                  <>
                    <span className="material-icons text-sm animate-spin">refresh</span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="material-icons text-sm">save</span>
                    Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
