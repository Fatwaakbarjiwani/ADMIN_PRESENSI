import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventDetail,
  updateEvent,
  fetchEvent,
} from "../../redux/actions/presensiAction";
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";
import Swal from "sweetalert2";

const kampusCenter = [-6.954089024622504, 110.45883246944116];

function parseLokasi(lokasi) {
  if (!lokasi) return [];
  try {
    let parsed = typeof lokasi === "string" ? JSON.parse(lokasi) : lokasi;
    while (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }
    if (!Array.isArray(parsed) || parsed.length < 3) return [];
    const first = parsed[0];
    if (Array.isArray(first) && first.length >= 2 && typeof first[0] === "number") {
      return [parsed];
    }
    if (typeof first === "number" && typeof parsed[1] === "number") {
      return [parsed];
    }
    return [];
  } catch {
    return [];
  }
}

function timeToInput(t) {
  if (!t) return "";
  const s = String(t);
  if (s.length >= 8) return s.slice(0, 5);
  if (s.length >= 5) return s.slice(0, 5);
  return s;
}

function dateToInput(d) {
  if (!d) return "";
  const s = String(d).trim();
  if (s.length >= 10) return s.slice(0, 10);
  return s;
}

const HARI_MINGGUAN_OPTIONS = [
  "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"
];

function normalizeHariMingguan(val) {
  if (!val || typeof val !== "string") return "";
  const v = val.trim();
  const found = HARI_MINGGUAN_OPTIONS.find((h) => h.toLowerCase() === v.toLowerCase());
  return found ?? (v.charAt(0).toUpperCase() + v.slice(1).toLowerCase());
}

export default function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const units = useSelector((state) => state.unitDetail.units);
  const eventDetail = useSelector((state) => state.presensi.eventDetail);
  const eventDetailLoading = useSelector((state) => state.presensi.eventDetailLoading);
  const isSuperAdmin = user?.role === "super_admin";

  const mapRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const initialDrawDoneRef = useRef(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [form, setForm] = useState({
    nama_event: "",
    deskripsi: "",
    tipe_event: "harian",
    tanggal_mulai: "",
    tanggal_selesai: "",
    waktu_mulai: "",
    waktu_selesai: "",
    hari_mingguan: "",
    nama_tempat: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchEventDetail(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isSuperAdmin) dispatch(fetchAllUnit());
  }, [dispatch, isSuperAdmin]);

  useEffect(() => {
    if (!eventDetail || eventDetail.id !== Number(id)) return;
    setForm({
      nama_event: eventDetail.nama_event ?? "",
      deskripsi: eventDetail.deskripsi ?? "",
      tipe_event: eventDetail.tipe_event ?? "harian",
      tanggal_mulai: dateToInput(eventDetail.tanggal_mulai),
      tanggal_selesai: dateToInput(eventDetail.tanggal_selesai),
      waktu_mulai: timeToInput(eventDetail.waktu_mulai),
      waktu_selesai: timeToInput(eventDetail.waktu_selesai),
      hari_mingguan: normalizeHariMingguan(eventDetail.hari_mingguan),
      nama_tempat: eventDetail.nama_tempat ?? "",
    });
    if (isSuperAdmin && eventDetail.ms_unit_id) {
      setSelectedUnit(String(eventDetail.ms_unit_id));
    }
    const polygons = parseLokasi(eventDetail.lokasi);
    if (polygons.length > 0 && polygons[0].length >= 3) {
      setPolygonCoords(polygons[0]);
    } else {
      setPolygonCoords([]);
    }
  }, [eventDetail, id, isSuperAdmin]);

  // Gambar polygon lokasi ke peta setelah peta siap dan data event ada (perbaikan peta tidak tampil saat edit)
  useEffect(() => {
    if (!mapReady || !eventDetail || eventDetail.id !== Number(id)) return;
    const polygons = parseLokasi(eventDetail.lokasi);
    if (polygons.length === 0 || polygons[0].length < 3) return;
    const rawCoords = polygons[0];
    // Leaflet memakai [lat, lng]; jika backend kirim [lng, lat] (GeoJSON), tukar
    const coords = rawCoords.map((c) => {
      const a = c[0];
      const b = c[1];
      if (a >= -90 && a <= 90 && b >= -180 && b <= 180) return [a, b];
      return [b, a];
    });
    if (initialDrawDoneRef.current) return;
    const drawnItems = drawnItemsRef.current;
    const map = mapRef.current?._leaflet_map;
    if (!drawnItems || !map) return;

    const drawPolygon = () => {
      if (initialDrawDoneRef.current) return;
      const di = drawnItemsRef.current;
      const m = mapRef.current?._leaflet_map;
      if (!di || !m) return;
      initialDrawDoneRef.current = true;
      di.clearLayers();
      const polygon = L.polygon(coords, {
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 0.2,
      });
      di.addLayer(polygon);
      m.invalidateSize();
      m.fitBounds(polygon.getBounds(), { padding: [20, 20], maxZoom: 18 });
    };

    setTimeout(drawPolygon, 200);
  }, [mapReady, eventDetail, id]);

  useEffect(() => {
    if (eventDetail?.id !== Number(id)) initialDrawDoneRef.current = false;
  }, [eventDetail, id]);

  // Inisialisasi peta hanya setelah form ter-render (eventDetail ada), agar mapRef.current sudah ter-set
  useEffect(() => {
    if (!eventDetail || eventDetail.id !== Number(id)) return;
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
        const layer = layers[0];
        try {
          const latlngsArray = layer.getLatLngs();
          if (latlngsArray && latlngsArray[0]) {
            let latlngs = latlngsArray[0].map((ll) => [ll.lat, ll.lng]);
            if (
              latlngs.length > 1 &&
              latlngs[0][0] === latlngs[latlngs.length - 1][0] &&
              latlngs[0][1] === latlngs[latlngs.length - 1][1]
            ) {
              latlngs = latlngs.slice(0, -1);
            }
            setPolygonCoords(latlngs);
            return;
          }
        } catch (_) {}
      }
      setPolygonCoords([]);
    }

    map.on(L.Draw.Event.CREATED, function (e) {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);
      updatePolygonCoords();
    });

    map.on(L.Draw.Event.EDITED, function () {
      updatePolygonCoords();
    });

    map.on(L.Draw.Event.DELETED, function () {
      setTimeout(updatePolygonCoords, 100);
    });

    setMapReady(true);
    return () => {
      drawnItemsRef.current = null;
      setMapReady(false);
      const mapInstance = mapElement?._leaflet_map;
      if (!mapInstance) return;
      try {
        mapInstance.off();
        mapInstance.remove();
      } catch (_) {
        // Abaikan error saat unmount (mis. _leaflet_pos undefined)
      }
      if (mapElement) mapElement._leaflet_map = null;
    };
  }, [eventDetail, id]);

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
    if (!form.waktu_mulai?.trim() || !form.waktu_selesai?.trim()) {
      Swal.fire("Validasi", "Waktu mulai dan selesai wajib diisi", "warning");
      return;
    }
    if (form.tipe_event === "mingguan" && !form.hari_mingguan?.trim()) {
      Swal.fire("Validasi", "Tipe mingguan wajib memilih hari", "warning");
      return;
    }
    if (isSuperAdmin && !selectedUnit) {
      Swal.fire("Validasi", "Pilih unit untuk super admin", "warning");
      return;
    }

    setSubmitting(true);
    const payload = {
      nama_event: form.nama_event.trim(),
      deskripsi: form.deskripsi.trim(),
      tipe_event: form.tipe_event,
      waktu_mulai: form.waktu_mulai.trim(),
      waktu_selesai: form.waktu_selesai.trim(),
      nama_tempat: form.nama_tempat.trim(),
      lokasi: polygonCoords.length >= 3 ? polygonCoords : [],
    };
    if (form.tipe_event === "mingguan") {
      payload.hari_mingguan = form.hari_mingguan?.trim() || "";
    }
    if (form.tipe_event === "khusus") {
      if (form.tanggal_mulai?.trim()) payload.tanggal_mulai = form.tanggal_mulai.trim();
      if (form.tanggal_selesai?.trim()) payload.tanggal_selesai = form.tanggal_selesai.trim();
    }

    const result = await dispatch(
      updateEvent(Number(id), payload, isSuperAdmin, selectedUnit || null)
    );
    setSubmitting(false);

    if (result?.success) {
      Swal.fire({
        icon: "success",
        title: "Event berhasil diupdate",
        timer: 1500,
        showConfirmButton: false,
      });
      dispatch(fetchEventDetail(id));
      if (!isSuperAdmin) dispatch(fetchEvent("", null, false, null));
      else if (selectedUnit) dispatch(fetchEvent("", selectedUnit, true, null));
      navigate(`/event/${id}`);
    } else {
      Swal.fire("Error", result?.message ?? "Gagal mengupdate event", "error");
    }
  };

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

  if (!eventDetail && !eventDetailLoading) {
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
          <span className="material-icons text-white">event</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-800 tracking-tight uppercase">
            Edit Event
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Ubah data event presensi
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-full flex flex-col gap-6">
        <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-emerald-600">edit</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Form Edit Event
                </h3>
                <p className="text-emerald-100 text-xs font-medium">
                  Ubah form dan polygon lokasi di bawah
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
                <option value="harian">Harian</option>
                <option value="mingguan">Mingguan</option>
                <option value="khusus">Khusus</option>
              </select>
            </div>

            {form.tipe_event === "mingguan" && (
              <div>
                <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                  Hari Mingguan *
                </label>
                <select
                  value={form.hari_mingguan}
                  onChange={(e) => setForm((f) => ({ ...f, hari_mingguan: e.target.value }))}
                  className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white"
                >
                  <option value="">Pilih Hari</option>
                  {HARI_MINGGUAN_OPTIONS.map((hari) => (
                    <option key={hari} value={hari}>{hari}</option>
                  ))}
                </select>
              </div>
            )}

            {form.tipe_event === "khusus" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                    Tanggal Mulai
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
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={form.tanggal_selesai}
                    onChange={(e) => setForm((f) => ({ ...f, tanggal_selesai: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

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
                Lokasi (Polygon)
              </label>
              <p className="text-xs text-emerald-600 mb-2">
                Edit polygon di peta menggunakan tool draw (ikon pensil). Satu polygon untuk area lokasi event.
              </p>
              <div
                ref={mapRef}
                className="w-full h-[400px] border-2 border-emerald-200"
                style={{ minHeight: "400px" }}
              />
              {polygonCoords.length > 0 && (
                <p className="text-xs text-emerald-700 mt-2 font-medium">
                  Polygon tersimpan ({polygonCoords.length} titik)
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t-2 border-emerald-200">
              <button
                type="button"
                onClick={() => navigate(`/event/${id}`)}
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
