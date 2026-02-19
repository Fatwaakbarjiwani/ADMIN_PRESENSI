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

function parseAllLokasi(eventDetail) {
  const allLokasi = [];
  if (eventDetail.lokasi) {
    const lokasi1 = parseLokasi(eventDetail.lokasi);
    if (lokasi1.length > 0) allLokasi.push(...lokasi1);
  }
  if (eventDetail.lokasi2) {
    const lokasi2 = parseLokasi(eventDetail.lokasi2);
    if (lokasi2.length > 0) allLokasi.push(...lokasi2);
  }
  if (eventDetail.lokasi3) {
    const lokasi3 = parseLokasi(eventDetail.lokasi3);
    if (lokasi3.length > 0) allLokasi.push(...lokasi3);
  }
  return allLokasi;
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
  const polygonRefsRef = useRef([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState(0);
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
      tipe_event: eventDetail.tipe_event ?? "Sholat Fardhu",
      tanggal_mulai: dateToInput(eventDetail.tanggal_mulai),
      tanggal_selesai: dateToInput(eventDetail.tanggal_selesai),
      waktu_mulai: timeToInput(eventDetail.waktu_mulai),
      waktu_selesai: timeToInput(eventDetail.waktu_selesai),
      waktu_masuk_mulai: timeToInput(eventDetail.waktu_masuk_mulai),
      waktu_masuk_selesai: timeToInput(eventDetail.waktu_masuk_selesai),
      waktu_pulang_mulai: timeToInput(eventDetail.waktu_pulang_mulai),
      waktu_pulang_selesai: timeToInput(eventDetail.waktu_pulang_selesai),
      hari_mingguan: normalizeHariMingguan(eventDetail.hari_mingguan),
      nama_tempat: eventDetail.nama_tempat ?? "",
    });
    if (isSuperAdmin && eventDetail.ms_unit_id) {
      setSelectedUnit(String(eventDetail.ms_unit_id));
    }
    const polygons = parseAllLokasi(eventDetail);
    setPolygonCoords(polygons);
  }, [eventDetail, id, isSuperAdmin]);

  useEffect(() => {
    if (!mapReady || !eventDetail || eventDetail.id !== Number(id)) return;
    const polygons = parseAllLokasi(eventDetail);
    if (polygons.length === 0) return;
    if (initialDrawDoneRef.current) return;
    const drawnItems = drawnItemsRef.current;
    const map = mapRef.current?._leaflet_map;
    if (!drawnItems || !map) return;

    const drawPolygons = () => {
      if (initialDrawDoneRef.current) return;
      const di = drawnItemsRef.current;
      const m = mapRef.current?._leaflet_map;
      if (!di || !m) return;
      initialDrawDoneRef.current = true;
      di.clearLayers();
      
      const colors = [
        { color: "#10b981", fillColor: "#10b981" },
        { color: "#3b82f6", fillColor: "#3b82f6" },
        { color: "#f59e0b", fillColor: "#f59e0b" },
      ];
      
      const bounds = [];
      polygonRefsRef.current = [];
      polygons.forEach((rawCoords, index) => {
        if (rawCoords.length < 3) return;
        const coords = rawCoords.map((c) => {
          const a = c[0];
          const b = c[1];
          if (a >= -90 && a <= 90 && b >= -180 && b <= 180) return [a, b];
          return [b, a];
        });
        
        const colorIndex = index % colors.length;
        const isSelected = selectedPolygonIndex === index;
        const polygon = L.polygon(coords, {
          color: colors[colorIndex].color,
          fillColor: colors[colorIndex].fillColor,
          fillOpacity: isSelected ? 0.4 : 0.2,
          weight: isSelected ? 4 : 2,
        });
        
        const lokasiName = index === 0 ? "Lokasi Utama" : `Lokasi ${index + 1}`;
        polygon.bindPopup(`<b>${lokasiName}</b>`);

        polygon.on("click", () => {
          setSelectedPolygonIndex(index);
          m.fitBounds(polygon.getBounds(), { padding: [50, 50], maxZoom: 18 });
        });
        
        di.addLayer(polygon);
        polygonRefsRef.current[index] = polygon;
        bounds.push(polygon.getBounds());
      });
      
      m.invalidateSize();
      if (bounds.length > 0) {
        const groupBounds = bounds.reduce((acc, b) => acc.extend(b), bounds[0]);
        m.fitBounds(groupBounds, { padding: [20, 20], maxZoom: 18 });
      }
    };

    setTimeout(drawPolygons, 200);
  }, [mapReady, eventDetail, id, selectedPolygonIndex]);

  useEffect(() => {
    if (eventDetail?.id !== Number(id)) initialDrawDoneRef.current = false;
  }, [eventDetail, id]);

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

    setMapReady(true);
    return () => {
      drawnItemsRef.current = null;
      setMapReady(false);
      const mapInstance = mapElement?._leaflet_map;
      if (!mapInstance) return;
      try {
        mapInstance.off();
        mapInstance.remove();
      } catch { void 0; }
      if (mapElement) mapElement._leaflet_map = null;
    };
  }, [eventDetail, id]);

  const navigateToPolygon = (index) => {
    if (!mapRef.current?._leaflet_map || !polygonRefsRef.current[index]) return;
    const polygon = polygonRefsRef.current[index];
    setSelectedPolygonIndex(index);
    mapRef.current._leaflet_map.fitBounds(polygon.getBounds(), {
      padding: [50, 50],
      maxZoom: 18,
    });
  };

  useEffect(() => {
    if (!mapRef.current?._leaflet_map || !drawnItemsRef.current || !mapReady) {
      return;
    }

    const map = mapRef.current._leaflet_map;
    const drawnItems = drawnItemsRef.current;

    if (!initialDrawDoneRef.current) {
      return;
    }

    drawnItems.clearLayers();
    polygonRefsRef.current = [];

    if (Array.isArray(polygonCoords) && polygonCoords.length > 0) {
      const colors = [
        { color: "#10b981", fillColor: "#10b981" },
        { color: "#3b82f6", fillColor: "#3b82f6" },
        { color: "#f59e0b", fillColor: "#f59e0b" },
      ];
      
      const bounds = [];
      polygonCoords.forEach((coords, index) => {
        if (coords && Array.isArray(coords) && coords.length >= 3) {
          const colorIndex = index % colors.length;
          const isSelected = selectedPolygonIndex === index;
          const polygon = L.polygon(coords, {
            color: colors[colorIndex].color,
            fillColor: colors[colorIndex].fillColor,
            fillOpacity: isSelected ? 0.4 : 0.2,
            weight: isSelected ? 4 : 2,
          });

          const lokasiName = index === 0 ? "Lokasi Utama" : `Lokasi ${index + 1}`;
          polygon.bindPopup(`<b>${lokasiName}</b>`);

          polygon.on("click", () => {
            setSelectedPolygonIndex(index);
            map.fitBounds(polygon.getBounds(), { padding: [50, 50], maxZoom: 18 });
          });

          drawnItems.addLayer(polygon);
          polygonRefsRef.current[index] = polygon;
          bounds.push(polygon.getBounds());
        }
      });

      if (bounds.length > 0) {
        const groupBounds = bounds.reduce((acc, b) => acc.extend(b), bounds[0]);
        map.fitBounds(groupBounds, { padding: [20, 20], maxZoom: 18 });
      }
    }
  }, [polygonCoords, mapReady, selectedPolygonIndex]);

  useEffect(() => {
    if (!drawnItemsRef.current || !mapReady) return;
    const drawnItems = drawnItemsRef.current;
    const layers = drawnItems.getLayers();
    const colors = [
      { color: "#10b981", fillColor: "#10b981" },
      { color: "#3b82f6", fillColor: "#3b82f6" },
      { color: "#f59e0b", fillColor: "#f59e0b" },
    ];
    
    layers.forEach((layer, index) => {
      if (layer instanceof L.Polygon) {
        const colorIndex = index % colors.length;
        const isSelected = selectedPolygonIndex === index;
        layer.setStyle({
          color: colors[colorIndex].color,
          fillColor: colors[colorIndex].fillColor,
          fillOpacity: isSelected ? 0.4 : 0.2,
          weight: isSelected ? 4 : 2,
        });
      }
    });
  }, [selectedPolygonIndex, mapReady]);

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

    const hasLokasi1 = polygonCoords.length > 0 && polygonCoords[0] && polygonCoords[0].length >= 3;
    const hasLokasi2 = polygonCoords.length > 1 && polygonCoords[1] && polygonCoords[1].length >= 3;
    const hasLokasi3 = polygonCoords.length > 2 && polygonCoords[2] && polygonCoords[2].length >= 3;

    const hadLokasi2 = eventDetail?.lokasi2 !== null && eventDetail?.lokasi2 !== undefined && eventDetail?.lokasi2 !== "";
    const hadLokasi3 = eventDetail?.lokasi3 !== null && eventDetail?.lokasi3 !== undefined && eventDetail?.lokasi3 !== "";

    payload.lokasi = hasLokasi1 ? polygonCoords[0] : "";

    if (hasLokasi2 || hadLokasi2) {
      payload.lokasi2 = hasLokasi2 ? polygonCoords[1] : "";
    }

    if (hasLokasi3 || hadLokasi3) {
      payload.lokasi3 = hasLokasi3 ? polygonCoords[2] : "";
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
        <div className="text-center bg-white p-8 border-2 border-emerald-200 shadow-lg">
          <span className="material-icons animate-spin text-5xl text-emerald-600">refresh</span>
          <p className="text-emerald-700 font-bold mt-3">Memuat data event...</p>
        </div>
      </div>
    );
  }

  if (!eventDetail && !eventDetailLoading) {
    return (
      <div className="w-full min-h-screen font-sans bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 border-2 border-emerald-200 shadow-lg">
          <span className="material-icons text-5xl text-emerald-400 mb-4">event_busy</span>
          <p className="text-emerald-800 font-medium">Event tidak ditemukan</p>
          <button
            type="button"
            onClick={() => navigate("/event")}
            className="mt-4 px-5 py-2.5 bg-emerald-600 text-white font-bold hover:bg-emerald-700 border-2 border-emerald-700 flex items-center gap-2 mx-auto"
          >
            <span className="material-icons">arrow_back</span>
            Kembali ke Daftar Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-6 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/event/${id}`)}
          className="p-2 hover:bg-emerald-50 transition"
        >
          <span className="material-icons text-emerald-700">arrow_back</span>
        </button>
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white text-xl">edit</span>
        </div>
        <div>
          <div className="text-xl font-black text-emerald-600 tracking-tight uppercase">
            Edit Event
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Ubah data event presensi
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-full flex flex-col gap-6">
        <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2">
                <span className="material-icons text-lg text-white">edit</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Form Edit Event
                </h3>
                <p className="text-emerald-100 text-sm font-medium">
                  Ubah form dan polygon lokasi di bawah
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {isSuperAdmin && (
              <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                  Unit *
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
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

            <div className="bg-emerald-50/50 p-4 border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Nama Event *
              </label>
              <input
                type="text"
                value={form.nama_event}
                onChange={(e) => setForm((f) => ({ ...f, nama_event: e.target.value }))}
                className="w-full px-3 py-2.5 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
                placeholder="Contoh: Sholat Jum'at"
              />
            </div>

            <div className="bg-emerald-50/50 p-4 border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Deskripsi
              </label>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
                className="w-full px-3 py-2.5 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
                rows={2}
                placeholder="Deskripsi event"
              />
            </div>

            <div className="bg-emerald-50/50 p-4 border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Tipe Event *
              </label>
              <select
                value={form.tipe_event}
                onChange={(e) => setForm((f) => ({ ...f, tipe_event: e.target.value }))}
                className="w-full px-3 py-2.5 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
              >
                <option value="Sholat Fardhu">Sholat Fardhu</option>
                <option value="Event & Kegiatan Islam">Event & Kegiatan Islam</option>
              </select>
            </div>

            {form.tipe_event === "Sholat Fardhu" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/50 p-4 border border-emerald-200">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                    Waktu Mulai *
                  </label>
                  <input
                    type="time"
                    value={form.waktu_mulai}
                    onChange={(e) => setForm((f) => ({ ...f, waktu_mulai: e.target.value }))}
                    className="w-full px-3 py-2.5 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
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
                    className="w-full px-3 py-2.5 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
                  />
                </div>
              </div>
            )}

            {form.tipe_event === "Event & Kegiatan Islam" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/50 p-4 border border-emerald-200">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                      Tanggal Mulai *
                    </label>
                    <input
                      type="date"
                      value={form.tanggal_mulai}
                      onChange={(e) => setForm((f) => ({ ...f, tanggal_mulai: e.target.value }))}
                      className="w-full px-3 py-2.5 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
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
                      className="w-full px-3 py-2.5 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                    Hari Mingguan (Opsional)
                  </label>
                  <select
                    value={form.hari_mingguan}
                    onChange={(e) => setForm((f) => ({ ...f, hari_mingguan: e.target.value }))}
                    className="w-full px-3 py-2.5 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
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

            <div className="bg-emerald-50/50 p-4 border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Nama Tempat
              </label>
              <input
                type="text"
                value={form.nama_tempat}
                onChange={(e) => setForm((f) => ({ ...f, nama_tempat: e.target.value }))}
                className="w-full px-3 py-2.5 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none bg-white font-medium text-emerald-900"
                placeholder="Contoh: Masjid ABA"
              />
            </div>

            <div className="bg-emerald-50/50 p-4 border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Lokasi (Polygon) - Maksimal 3 Lokasi
              </label>
              <p className="text-sm text-emerald-700 mb-3">
                Edit polygon di peta menggunakan tool draw (ikon pensil). Klik lokasi untuk fokus ke area tersebut.
              </p>
              {polygonCoords.length > 0 && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {polygonCoords.map((polygon, index) => {
                    const colors = [
                      { color: "#10b981", name: "Hijau", bg: "bg-emerald-50", border: "border-emerald-300" },
                      { color: "#3b82f6", name: "Biru", bg: "bg-blue-50", border: "border-blue-300" },
                      { color: "#f59e0b", name: "Orange", bg: "bg-orange-50", border: "border-orange-300" },
                    ];
                    const colorIndex = index % colors.length;
                    const color = colors[colorIndex];
                    const isSelected = selectedPolygonIndex === index;
                      return (
                        <div
                          key={index}
                          onClick={() => navigateToPolygon(index)}
                          className={`${color.bg} border-2 ${isSelected ? "ring-2 ring-offset-2 ring-emerald-500" : ""} p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected ? "shadow-md" : ""
                          }`}
                          style={{ borderColor: color.color }}
                        >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="inline-block w-4 h-4 border-2 border-gray-300"
                            style={{ backgroundColor: color.color }}
                          ></span>
                          <span className={`font-bold text-sm ${isSelected ? 'text-emerald-800' : 'text-gray-700'}`}>
                            {index === 0 ? "Lokasi Utama" : `Lokasi ${index + 1}`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <p className="font-medium">{polygon.length} titik koordinat</p>
                          <p className="text-gray-500">Warna: {color.name}</p>
                        </div>
                        {isSelected && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <span className="material-icons text-sm">my_location</span>
                            <span>Terpilih</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div
                ref={mapRef}
                className="w-full h-[500px] border-2 border-emerald-200 rounded-lg overflow-hidden"
                style={{ minHeight: "500px" }}
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-end pt-5 border-t-2 border-emerald-200">
              <button
                type="button"
                onClick={() => navigate(`/event/${id}`)}
                className="px-5 py-2.5 border-2 border-emerald-300 font-bold text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2"
              >
                <span className="material-icons text-lg">close</span>
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold border-2 border-emerald-700 transition-colors flex items-center gap-2 shadow-md"
              >
                {submitting ? (
                  <>
                    <span className="material-icons text-lg animate-spin">refresh</span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="material-icons text-lg">save</span>
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
