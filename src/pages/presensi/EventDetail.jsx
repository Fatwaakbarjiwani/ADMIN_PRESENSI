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

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const eventDetail = useSelector((state) => state.presensi.eventDetail);
  const eventDetailLoading = useSelector((state) => state.presensi.eventDetailLoading);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonLayerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

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
      } catch (_) {}
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

    const polygons = parseLokasi(eventDetail.lokasi);
    if (polygons.length > 0) {
      const layerGroup = L.layerGroup().addTo(map);
      polygonLayerRef.current = layerGroup;
      polygons.forEach((coords) => {
        const latlngs = Array.isArray(coords[0])
          ? coords.map((c) => [c[0], c[1]])
          : coords;
        if (latlngs.length >= 3) {
          const polygon = L.polygon(latlngs, {
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.2,
            weight: 2,
          });
          layerGroup.addLayer(polygon);
          map.fitBounds(polygon.getBounds(), { padding: [20, 20], maxZoom: 18 });
        }
      });
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
      } catch (_) {
        // Abaikan error saat unmount (mis. _leaflet_pos undefined)
      }
    };
  }, [eventDetail]);

  const formatTime = (t) => {
    if (!t) return "-";
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
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
          <div className="text-2xl font-black text-emerald-800 tracking-tight uppercase">
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
            <div className="bg-white border-2 border-emerald-200 shadow-lg">
              <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2">
                    <span className="material-icons text-lg text-emerald-600">info</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wide">
                      Informasi Event
                    </h2>
                    <p className="text-emerald-100 text-xs font-medium">
                      Data event presensi
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500 font-bold uppercase tracking-wide mb-1">Nama Event</dt>
                    <dd className="text-gray-900 font-semibold">{eventDetail.nama_event ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-bold uppercase tracking-wide mb-1">Tipe Event</dt>
                    <dd className="text-gray-900">{eventDetail.tipe_event ?? "-"}</dd>
                  </div>
                  {eventDetail.tipe_event === "mingguan" && (
                    <div>
                      <dt className="text-gray-500 font-bold uppercase tracking-wide mb-1">Hari Mingguan</dt>
                      <dd className="text-gray-900 font-semibold">
                        {eventDetail.hari_mingguan
                          ? eventDetail.hari_mingguan.charAt(0).toUpperCase() + eventDetail.hari_mingguan.slice(1).toLowerCase()
                          : "-"}
                      </dd>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <dt className="text-gray-500 font-bold uppercase tracking-wide mb-1">Deskripsi</dt>
                    <dd className="text-gray-900">{eventDetail.deskripsi ?? "-"}</dd>
                  </div>
                  {(eventDetail.tanggal_mulai || eventDetail.tanggal_selesai) && (
                    <div>
                      <dt className="text-gray-500 font-bold uppercase tracking-wide mb-1">Tanggal Mulai / Selesai</dt>
                      <dd className="text-gray-900">
                        {eventDetail.tanggal_mulai ?? "-"} / {eventDetail.tanggal_selesai ?? "-"}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500 font-bold uppercase tracking-wide mb-1">Waktu Mulai / Selesai</dt>
                    <dd className="text-gray-900">
                      {formatTime(eventDetail.waktu_mulai)} / {formatTime(eventDetail.waktu_selesai)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-bold uppercase tracking-wide mb-1">Nama Tempat</dt>
                    <dd className="text-gray-900">{eventDetail.nama_tempat ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-bold uppercase tracking-wide mb-1">Status</dt>
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
                  <div className="md:col-span-2">
                    <dt className="text-gray-500 font-bold uppercase tracking-wide mb-1">Dibuat / Diperbarui</dt>
                    <dd className="text-gray-900 text-xs">
                      {eventDetail.created_at ?? "-"} / {eventDetail.updated_at ?? "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white border-2 border-emerald-200 shadow-lg">
              <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2">
                    <span className="material-icons text-lg text-emerald-600">location_on</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wide">
                      Lokasi (Polygon)
                    </h2>
                    <p className="text-emerald-100 text-xs font-medium">
                      Peta area lokasi event
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div
                  ref={mapRef}
                  className="w-full h-[400px] border-2 border-emerald-200"
                  style={{ minHeight: "400px" }}
                />
                {mapReady && parseLokasi(eventDetail.lokasi).length === 0 && (
                  <p className="text-gray-500 text-sm mt-2">Tidak ada data polygon lokasi</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(`/event/${id}/pegawai`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold border-2 border-blue-700 transition-colors flex items-center gap-1"
              >
                <span className="material-icons text-sm">group_add</span>
                Tambah Pegawai ke Event
              </button>
              <button
                type="button"
                onClick={() => navigate(`/event/${id}/edit`)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold border-2 border-amber-700 transition-colors flex items-center gap-1"
              >
                <span className="material-icons text-sm">edit</span>
                Edit Event
              </button>
              <button
                type="button"
                onClick={() => navigate("/event")}
                className="px-4 py-2 border-2 border-emerald-300 text-emerald-700 font-bold hover:bg-emerald-50 transition-colors"
              >
                Kembali ke Daftar
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white border-2 border-emerald-200 shadow-lg p-12 text-center">
            <p className="text-gray-500 font-medium">Data event tidak ditemukan</p>
            <button
              type="button"
              onClick={() => navigate("/event")}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold hover:bg-emerald-700 border-2 border-emerald-700"
            >
              Kembali ke Daftar Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
