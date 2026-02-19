import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventDetail } from "../../redux/actions/presensiAction";

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

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const eventDetail = useSelector((state) => state.presensi.eventDetail);
  const eventDetailLoading = useSelector((state) => state.presensi.eventDetailLoading);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const polygonRefsRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);
  const [selectedPolygonIndex, setSelectedPolygonIndex] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchEventDetail(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!mapRef.current || !eventDetail) return;

    const mapElement = mapRef.current;
    const prevMap = mapInstanceRef.current;
    if (prevMap) {
      try {
        prevMap.off();
        prevMap.remove();
      } catch { void 0; }
      mapInstanceRef.current = null;
      polygonLayerRef.current = null;
    }

    const map = L.map(mapElement).setView(kampusCenter, 17);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const polygons = parseAllLokasi(eventDetail);
    if (polygons.length > 0) {
      const layerGroup = L.layerGroup().addTo(map);
      polygonLayerRef.current = layerGroup;
      
      const colors = [
        { color: "#10b981", fillColor: "#10b981" },
        { color: "#3b82f6", fillColor: "#3b82f6" },
        { color: "#f59e0b", fillColor: "#f59e0b" },
      ];
      
      const bounds = [];
      polygonRefsRef.current = [];
      polygons.forEach((coords, index) => {
        const latlngs = Array.isArray(coords[0])
          ? coords.map((c) => [c[0], c[1]])
          : coords;
        if (latlngs.length >= 3) {
          const colorIndex = index % colors.length;
          const isSelected = selectedPolygonIndex === index;
          const polygon = L.polygon(latlngs, {
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
          
          layerGroup.addLayer(polygon);
          polygonRefsRef.current[index] = polygon;
          bounds.push(polygon.getBounds());
        }
      });

      if (bounds.length > 0) {
        const groupBounds = bounds.reduce((acc, b) => acc.extend(b), bounds[0]);
        map.fitBounds(groupBounds, { padding: [20, 20], maxZoom: 18 });
      }
    }
    setMapReady(true);

    return () => {
      const mapInstance = mapInstanceRef.current;
      mapInstanceRef.current = null;
      polygonLayerRef.current = null;
      if (!mapInstance) return;
      try {
        mapInstance.off();
        mapInstance.remove();
      } catch { void 0; }
    };
  }, [eventDetail, selectedPolygonIndex]);

  const navigateToPolygon = (index) => {
    if (!mapInstanceRef.current || !polygonRefsRef.current[index]) return;
    const polygon = polygonRefsRef.current[index];
    setSelectedPolygonIndex(index);
    mapInstanceRef.current.fitBounds(polygon.getBounds(), {
      padding: [50, 50],
      maxZoom: 18,
    });
  };

  useEffect(() => {
    if (!polygonLayerRef.current) return;
    const layerGroup = polygonLayerRef.current;
    const layers = layerGroup.getLayers();
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
  }, [selectedPolygonIndex]);

  const formatTime = (t) => {
    if (!t) return "-";
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
  };

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-6 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/event")}
          className="p-2 hover:bg-emerald-50 transition"
        >
          <span className="material-icons text-emerald-700">arrow_back</span>
        </button>
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white text-xl">event</span>
        </div>
        <div>
          <div className="text-xl font-black text-emerald-600 tracking-tight uppercase">
            Detail Event
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Informasi dan lokasi event
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-full flex flex-col gap-6">
        {eventDetailLoading ? (
          <div className="bg-white border-2 border-emerald-200 shadow-lg p-12 text-center">
            <span className="material-icons animate-spin text-emerald-600 text-4xl">refresh</span>
            <p className="text-emerald-700 font-bold mt-2">Memuat detail event...</p>
          </div>
        ) : eventDetail ? (
          <>
            <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 border-b-2 border-emerald-700">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2">
                    <span className="material-icons text-lg text-white">info</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wide">
                      Informasi Event
                    </h2>
                    <p className="text-emerald-100 text-sm font-medium">
                      Data event presensi
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                    <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Nama Event</dt>
                    <dd className="text-emerald-900 font-semibold">{eventDetail.nama_event ?? "-"}</dd>
                  </div>
                  <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                    <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Tipe Event</dt>
                    <dd className="text-emerald-900">{eventDetail.tipe_event ?? "-"}</dd>
                  </div>
                  <div className="md:col-span-2 bg-emerald-50/50 p-4 border border-emerald-200">
                    <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Deskripsi</dt>
                    <dd className="text-emerald-900">{eventDetail.deskripsi ?? "-"}</dd>
                  </div>
                  
                  {eventDetail.tipe_event === "Sholat Fardhu" && (
                    <>
                      <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                        <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Waktu Mulai</dt>
                        <dd className="text-emerald-900">{formatTime(eventDetail.waktu_mulai)}</dd>
                      </div>
                      <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                        <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Waktu Selesai</dt>
                        <dd className="text-emerald-900">{formatTime(eventDetail.waktu_selesai)}</dd>
                      </div>
                    </>
                  )}
                  
                  {eventDetail.tipe_event === "Event & Kegiatan Islam" && (
                    <>
                      <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                        <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Tanggal Mulai</dt>
                        <dd className="text-emerald-900">{formatDate(eventDetail.tanggal_mulai)}</dd>
                      </div>
                      <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                        <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Tanggal Selesai</dt>
                        <dd className="text-emerald-900">{formatDate(eventDetail.tanggal_selesai)}</dd>
                      </div>
                      {eventDetail.hari_mingguan && (
                        <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                          <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Hari Mingguan</dt>
                          <dd className="text-emerald-900 font-semibold">
                            {eventDetail.hari_mingguan.charAt(0).toUpperCase() + eventDetail.hari_mingguan.slice(1).toLowerCase()}
                          </dd>
                        </div>
                      )}
                      <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                        <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Waktu Masuk Mulai</dt>
                        <dd className="text-emerald-900">{formatTime(eventDetail.waktu_masuk_mulai)}</dd>
                      </div>
                      <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                        <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Waktu Masuk Selesai</dt>
                        <dd className="text-emerald-900">{formatTime(eventDetail.waktu_masuk_selesai)}</dd>
                      </div>
                      <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                        <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Waktu Pulang Mulai</dt>
                        <dd className="text-emerald-900">{formatTime(eventDetail.waktu_pulang_mulai)}</dd>
                      </div>
                      <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                        <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Waktu Pulang Selesai</dt>
                        <dd className="text-emerald-900">{formatTime(eventDetail.waktu_pulang_selesai)}</dd>
                      </div>
                    </>
                  )}
                  <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                    <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Nama Tempat</dt>
                    <dd className="text-emerald-900">{eventDetail.nama_tempat ?? "-"}</dd>
                  </div>
                  <div className="bg-emerald-50/50 p-4 border border-emerald-200">
                    <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Status</dt>
                    <dd>
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-bold border ${
                          eventDetail.is_active
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        {eventDetail.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </dd>
                  </div>
                  <div className="md:col-span-2 bg-emerald-50/50 p-4 border border-emerald-200">
                    <dt className="text-emerald-700 font-bold uppercase tracking-wide mb-1">Dibuat / Diperbarui</dt>
                    <dd className="text-emerald-900 text-xs">
                      {eventDetail.created_at ?? "-"} / {eventDetail.updated_at ?? "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 border-b-2 border-emerald-700">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2">
                    <span className="material-icons text-lg text-white">location_on</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wide">
                      Lokasi (Polygon)
                    </h2>
                    <p className="text-emerald-100 text-sm font-medium">
                      Peta area lokasi event - Klik lokasi untuk fokus
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {parseAllLokasi(eventDetail).length > 0 && (
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {parseAllLokasi(eventDetail).map((polygon, index) => {
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
                  className="w-full h-[500px] border-2 border-emerald-200 overflow-hidden"
                  style={{ minHeight: "500px" }}
                />
                {mapReady && parseAllLokasi(eventDetail).length === 0 && (
                  <p className="text-gray-500 text-sm mt-2 text-center">Tidak ada data polygon lokasi</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(`/event/${id}/pegawai`)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold border-2 border-emerald-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <span className="material-icons text-lg">group_add</span>
                Tambah Pegawai ke Event
              </button>
              <button
                type="button"
                onClick={() => navigate(`/event/${id}/edit`)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold border-2 border-amber-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <span className="material-icons text-lg">edit</span>
                Edit Event
              </button>
              <button
                type="button"
                onClick={() => navigate("/event")}
                className="px-5 py-2.5 border-2 border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2"
              >
                <span className="material-icons text-lg">arrow_back</span>
                Kembali ke Daftar
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white border-2 border-emerald-200 shadow-lg p-12 text-center">
            <span className="material-icons text-5xl text-emerald-400 mb-4">event_busy</span>
            <p className="text-emerald-800 font-medium">Data event tidak ditemukan</p>
            <button
              type="button"
              onClick={() => navigate("/event")}
              className="mt-4 px-5 py-2.5 bg-emerald-600 text-white font-bold hover:bg-emerald-700 border-2 border-emerald-700 flex items-center gap-2 mx-auto"
            >
              <span className="material-icons">arrow_back</span>
              Kembali ke Daftar Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
