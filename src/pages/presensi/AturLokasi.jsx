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
  // fetchUnitDetailByUserId,
  fetchUnitDetails,
  // createUnitDetailV2,
  // deleteUnitDetail,
  // fetchAllUnit,
  // createUnitDetailV1,
} from "../../redux/actions/unitDetailAction";
import axios from "axios";

const kampusCenter = [-6.954089024622504, 110.45883246944116];

const validateAndCleanPolygonData = (data) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  if (Array.isArray(data[0])) {
    const validPolygons = data.filter(
      (polygon) =>
        Array.isArray(polygon) &&
        polygon.length >= 3 &&
        polygon.every(
          (coord) =>
            Array.isArray(coord) &&
            coord.length === 2 &&
            typeof coord[0] === "number" &&
            typeof coord[1] === "number" &&
            !isNaN(coord[0]) &&
            !isNaN(coord[1]) &&
            coord[0] >= -90 &&
            coord[0] <= 90 &&
            coord[1] >= -180 &&
            coord[1] <= 180
        )
    );
    return validPolygons;
  }

  if (
    data.length >= 3 &&
    data.every(
      (coord) =>
        Array.isArray(coord) &&
        coord.length === 2 &&
        typeof coord[0] === "number" &&
        typeof coord[1] === "number" &&
        !isNaN(coord[0]) &&
        !isNaN(coord[1]) &&
        coord[0] >= -90 &&
        coord[0] <= 90 &&
        coord[1] >= -180 &&
        coord[1] <= 180
    )
  ) {
    return [data];
  }

  return [];
};

export default function AturLokasi() {
  const mapRef = useRef(null);
  const [polygonCoords, setPolygonCoords] = useState([]);
  const dispatch = useDispatch();
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const token = useSelector((state) => state.auth.token);
  const drawnItemsRef = useRef();
  const layerIndexMapRef = useRef(new Map());

  const unitDetails = useSelector((state) => state.unitDetail.data);

  // Filter unit details based on search term
  const filteredUnits = unitDetails.filter(
    (unit) =>
      unit.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.level?.toString().includes(searchTerm)
  );

  useEffect(() => {
    if (editLoading == false) {
      dispatch(fetchUnitDetails());
    }
  }, [dispatch, editLoading]);

  const handleStartEdit = async (id) => {
    setEditLoading(true);
    setMapLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/unit-detail/get-by-unit-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res.data;
      setEditId(id);
      if (data && data.length > 0 && data[0]) {
        const unitDetail = data[0];
        const allPolygons = [];
        Object.keys(unitDetail).forEach((key) => {
          if (
            key.startsWith("lokasi") &&
            Array.isArray(unitDetail[key]) &&
            unitDetail[key].length > 0
          ) {
            const lokasiData = unitDetail[key];

            if (Array.isArray(lokasiData[0]) && lokasiData[0].length === 2) {
              allPolygons.push(lokasiData);
            } else if (
              Array.isArray(lokasiData[0]) &&
              Array.isArray(lokasiData[0][0]) &&
              lokasiData[0][0].length === 2
            ) {
              lokasiData.forEach((polygon) => {
                allPolygons.push(polygon);
              });
            }
          }
        });

        setPolygonCoords(allPolygons);
      } else {
        setPolygonCoords([]);
      }
    } catch {
      Swal.fire({ icon: "error", title: "Gagal mengambil data unit detail" });
    }
    setEditLoading(false);

    // Hide loading after map is ready
    setTimeout(() => {
      setMapLoading(false);
      // Force map refresh after loading is hidden
      if (mapRef.current && mapRef.current._leaflet_map) {
        mapRef.current._leaflet_map.invalidateSize();
      }
    }, 800);
  };

  const handleDeletePolygon = (index) => {
    const newPolygonCoords = [...polygonCoords];
    newPolygonCoords[index] = [];
    setPolygonCoords(newPolygonCoords);

    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      setTimeout(() => {
        const drawnItems = drawnItemsRef.current;

        newPolygonCoords.forEach((coords, idx) => {
          if (coords && Array.isArray(coords) && coords.length >= 3) {
            const colors = [
              { color: "#10b981", fillColor: "#10b981" },
              { color: "#3b82f6", fillColor: "#3b82f6" },
              { color: "#f59e0b", fillColor: "#f59e0b" },
              { color: "#ef4444", fillColor: "#ef4444" },
              { color: "#8b5cf6", fillColor: "#8b5cf6" },
              { color: "#06b6d4", fillColor: "#06b6d4" },
            ];

            const colorIndex = idx % colors.length;
            const polygon = L.polygon(coords, {
              color: colors[colorIndex].color,
              fillColor: colors[colorIndex].fillColor,
              fillOpacity: 0.2,
            });

            const lokasiName = idx === 0 ? "Lokasi" : `Lokasi${idx + 1}`;
            polygon.bindPopup(
              `<b>${lokasiName}</b><br>Warna: ${colors[colorIndex].color}`
            );

            drawnItems.addLayer(polygon);
            polygon._polygonIndex = idx;
          }
        });
      }, 100);
    }
  };

  const handleEdit = async () => {
    setEditLoading(true);
    try {
      const requestData = {};

      if (polygonCoords.length > 0) {
        requestData.lokasi = polygonCoords[0];
      }

      if (polygonCoords.length > 1) {
        requestData.lokasi2 = polygonCoords[1];
      } else {
        requestData.lokasi2 = [];
      }

      if (polygonCoords.length > 2) {
        requestData.lokasi3 = polygonCoords[2];
      } else {
        requestData.lokasi3 = [];
      }

      await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/api/unit-detail/update-location/${editId}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditId(null);
      setPolygonCoords([]);
      dispatch(fetchUnitDetails());
      Swal.fire({ icon: "success", title: "Unit detail berhasil diupdate" });
    } catch {
      Swal.fire({ icon: "error", title: "Gagal update unit detail" });
    }
    setEditLoading(false);
  };

  useEffect(() => {
    if (!editId) return;

    const mapElement = mapRef.current;
    if (!mapElement) return;

    if (mapElement._leaflet_map) {
      return;
    }

    const map = L.map(mapElement).setView(kampusCenter, 17);
    if (mapElement) {
      mapElement._leaflet_map = map;
    }

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      loadingTimeout: 10000,
    }).addTo(map);

    // Force map to refresh and invalidate size
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);

    // Additional refresh when map container is ready
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        map.setView(kampusCenter, 17);
      }
    }, 300);

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

      drawnItems.addLayer(e.layer);
      updatePolygonCoords();
    });

    map.on(L.Draw.Event.EDITED, function () {
      updatePolygonCoords();
    });

    map.on(L.Draw.Event.DELETED, function () {
      setTimeout(() => {
        updatePolygonCoords();
      }, 100);
    });
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

              let latlngs = latlngsArray[0].map((latlng) => [
                latlng.lat,
                latlng.lng,
              ]);
              if (
                latlngs.length > 1 &&
                latlngs[0][0] === latlngs[latlngs.length - 1][0] &&
                latlngs[0][1] === latlngs[latlngs.length - 1][1]
              ) {
                latlngs = latlngs.slice(0, -1);
              }
              return latlngs;
            } catch {
              return null;
            }
          })
          .filter((polygon) => polygon !== null);

        const validPolygons = validateAndCleanPolygonData(allPolygons);
        setPolygonCoords(validPolygons);
      } else {
        setPolygonCoords([]);
      }
    }
    return () => {
      if (mapElement && mapElement._leaflet_map) {
        mapElement._leaflet_map.remove();
        mapElement._leaflet_map = null;
      }
    };
  }, [editId]);

  useEffect(() => {
    if (!editId || !mapRef.current || !drawnItemsRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        if (!mapRef.current._leaflet_map) {
          return;
        }

        const map = mapRef.current._leaflet_map;
        const drawnItems = drawnItemsRef.current;
        drawnItems.clearLayers();
        layerIndexMapRef.current.clear();

        if (!Array.isArray(polygonCoords) || !polygonCoords.length) {
          return;
        }

        polygonCoords.forEach((coords, index) => {
          try {
            if (coords && Array.isArray(coords) && coords.length >= 3) {
              const validCoords = coords.filter(
                (coord) =>
                  Array.isArray(coord) &&
                  coord.length === 2 &&
                  typeof coord[0] === "number" &&
                  typeof coord[1] === "number"
              );

              if (validCoords.length >= 3) {
                const isValidCoords = validCoords.every(
                  (coord) =>
                    coord[0] >= -90 &&
                    coord[0] <= 90 &&
                    coord[1] >= -180 &&
                    coord[1] <= 180 &&
                    !isNaN(coord[0]) &&
                    !isNaN(coord[1])
                );

                if (isValidCoords) {
                  try {
                    const colors = [
                      { color: "#10b981", fillColor: "#10b981" },
                      { color: "#3b82f6", fillColor: "#3b82f6" },
                      { color: "#f59e0b", fillColor: "#f59e0b" },
                      { color: "#ef4444", fillColor: "#ef4444" },
                      { color: "#8b5cf6", fillColor: "#8b5cf6" },
                      { color: "#06b6d4", fillColor: "#06b6d4" },
                    ];

                    const colorIndex = index % colors.length;
                    const polygon = L.polygon(validCoords, {
                      color: colors[colorIndex].color,
                      fillColor: colors[colorIndex].fillColor,
                      fillOpacity: 0.2,
                    });

                    const lokasiName =
                      index === 0 ? "Lokasi" : `Lokasi${index + 1}`;
                    polygon.bindPopup(
                      `<b>${lokasiName}</b><br>Warna: ${colors[colorIndex].color}`
                    );

                    drawnItems.addLayer(polygon);
                    layerIndexMapRef.current.set(polygon, index);
                    polygon._polygonIndex = index;

                    if (index === 0) {
                      map.fitBounds(polygon.getBounds());
                    } else {
                      const currentBounds = map.getBounds();
                      const newBounds = polygon.getBounds();
                      const combinedBounds = currentBounds.extend(newBounds);
                      map.fitBounds(combinedBounds);
                    }
                  } catch (error) {
                    console.error("Error creating polygon:", error);
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error processing polygon:", error);
          }
        });
      } catch (error) {
        console.error("Error in polygon rendering:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [editId, polygonCoords]);

  useEffect(() => {
    if (!editId && drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      setMapLoading(false);
    }
  }, [editId]);

  // Reset search when exiting edit mode
  useEffect(() => {
    if (!editId) {
      setSearchTerm("");
    }
  }, [editId]);

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
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

      <main className="flex-1">
        {!editId ? (
          <section className="bg-white min-h-screen">
            <div className="max-w-5xl mx-auto px-2 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="material-icons text-emerald-600">
                    apartment
                  </span>
                  Pilih Unit Detail untuk Edit Lokasi
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredUnits.length} dari {unitDetails.length} unit
                </span>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-icons text-gray-400 text-lg">
                      search
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari unit berdasarkan nama atau level..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <span className="material-icons text-gray-400 hover:text-gray-600 text-lg">
                        clear
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className="relative bg-white border-2 border-gray-200 rounded-xl shadow-sm p-6 transition-all duration-200 cursor-pointer group hover:border-emerald-300 hover:shadow-lg"
                      onClick={() => {
                        if (!editLoading) {
                          handleStartEdit(unit.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Building Info */}
                          <div className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg flex-shrink-0">
                              <span className="material-icons text-emerald-600 text-xl">
                                business
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">
                                {unit.nama || "Nama tidak tersedia"}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                  Level {unit.level}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 rounded-lg transition-colors">
                            <span className="material-icons text-xl">edit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <span className="material-icons text-gray-400 text-2xl">
                        search_off
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Tidak ada unit ditemukan
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Tidak ada unit yang cocok dengan pencarian &ldquo;
                      {searchTerm}&rdquo;
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Hapus Filter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <div className="relative w-full h-screen">
            <div ref={mapRef} className="w-full h-full" />

            {/* Map Loading Indicator */}
            {mapLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[999]">
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">
                      Memuat Peta
                    </div>
                    <div className="text-sm text-gray-600">
                      Mohon tunggu sebentar...
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute top-16 right-6 z-[1000] w-96">
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="material-icons text-white text-sm">
                        edit_location
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xs">EDIT LOKASI</h3>
                      <p className="text-xs opacity-90">Gambar polygon area</p>
                    </div>
                  </div>
                  <button
                    className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                    onClick={() => {
                      setEditId(null);
                      setPolygonCoords([]);
                    }}
                    title="Tutup panel"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    {polygonCoords.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-icons text-emerald-600 text-sm">
                            layers
                          </span>
                          <h4 className="font-semibold text-gray-800 text-sm">
                            Polygon ({polygonCoords.length}/3)
                          </h4>
                        </div>

                        <div className="space-y-2">
                          {polygonCoords.map((polygon, index) => {
                            const colors = [
                              {
                                color: "#10b981",
                                name: "Hijau",
                                bg: "bg-emerald-50",
                              },
                              {
                                color: "#3b82f6",
                                name: "Biru",
                                bg: "bg-blue-50",
                              },
                              {
                                color: "#f59e0b",
                                name: "Orange",
                                bg: "bg-orange-50",
                              },
                              {
                                color: "#ef4444",
                                name: "Merah",
                                bg: "bg-red-50",
                              },
                              {
                                color: "#8b5cf6",
                                name: "Ungu",
                                bg: "bg-purple-50",
                              },
                              {
                                color: "#06b6d4",
                                name: "Cyan",
                                bg: "bg-cyan-50",
                              },
                            ];
                            const colorIndex = index % colors.length;
                            const color = colors[colorIndex];

                            return (
                              <div
                                key={index}
                                className={`${color.bg} p-2 rounded-lg border-l-3 flex items-center justify-between`}
                                style={{ borderLeftColor: color.color }}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color.color }}
                                  ></div>
                                  <div>
                                    <div className="font-semibold text-gray-800 text-xs">
                                      {index === 0
                                        ? "Lokasi Utama"
                                        : `Lokasi ${index + 1}`}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {color.name}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeletePolygon(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded p-1 transition-colors"
                                  title="Hapus polygon"
                                >
                                  <span className="material-icons text-xs">
                                    delete
                                  </span>
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {polygonCoords.length < 3 && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-1 text-blue-700">
                              <span className="material-icons text-xs">
                                info
                              </span>
                              <span className="text-xs">
                                Gunakan tool di pojok kiri peta (maks 3)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <span className="material-icons text-yellow-600 text-sm">
                            warning
                          </span>
                          <div>
                            <div className="font-semibold text-xs">
                              Belum ada polygon
                            </div>
                            <div className="text-xs">
                              Gunakan tool di pojok kiri peta
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      onClick={handleEdit}
                      disabled={editLoading || polygonCoords.length === 0}
                    >
                      <span className="material-icons text-sm">save</span>
                      <span>{editLoading ? "Saving..." : "Simpan"}</span>
                    </button>

                    <button
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg text-sm"
                      onClick={() => {
                        setEditId(null);
                        setPolygonCoords([]);
                      }}
                    >
                      <span className="material-icons text-sm">cancel</span>
                      <span>Batal</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
