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

// Helper function untuk memvalidasi dan membersihkan data polygon
const validateAndCleanPolygonData = (data) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Jika data adalah array of arrays (multiple polygon)
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
            coord[0] <= 90 && // latitude valid
            coord[1] >= -180 &&
            coord[1] <= 180 // longitude valid
        )
    );
    return validPolygons;
  }

  // Jika data adalah single polygon array (seperti data yang Anda berikan)
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
        coord[0] <= 90 && // latitude valid
        coord[1] >= -180 &&
        coord[1] <= 180 // longitude valid
    )
  ) {
    return [data]; // Wrap dalam array untuk konsistensi
  }

  return [];
};

export default function AturLokasi() {
  const mapRef = useRef(null);
  const [polygonCoords, setPolygonCoords] = useState([]); // Array of polygon arrays
  // const [form, setForm] = useState({ name: "" });
  // const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [editId, setEditId] = useState(null);
  // const [editForm, setEditForm] = useState({ name: "" });
  const [editLoading, setEditLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const drawnItemsRef = useRef();
  const layerIndexMapRef = useRef(new Map()); // Untuk mapping layer dengan index

  // Ambil data unit detail dari redux
  const unitDetails = useSelector((state) => state.unitDetail.data);
  // const units = useSelector((state) => state.unitDetail.units);
  // const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    if (editLoading == false) {
      dispatch(fetchUnitDetails());
      // dispatch(fetchAllUnit());
    }
    // if (user?.role !== "super_admin" && editLoading == false) {
    //   dispatch(fetchUnitDetailByUserId(user?.unit_id));
    // }
  }, [dispatch, editLoading]);

  // const handleCreate = () => {
  //   if (
  //     !form.name.trim() ||
  //     polygonCoords.length === 0 ||
  //     (isSuperAdmin && !form.unit_id)
  //   ) {
  //     Swal.fire({
  //       icon: "error",
  //       title: isSuperAdmin
  //         ? "Pilih unit, lengkapi nama detail dan gambar area!"
  //         : "Lengkapi nama detail dan gambar area!",
  //     });
  //     return;
  //   }
  //   setEditLoading(true);
  //   if (isSuperAdmin) {
  //     // Super admin: kirim unit_id

  //     dispatch(
  //       createUnitDetailV1(
  //         { name: form.name, lokasi: polygonCoords, unit_id: form.unit_id },
  //         () => {
  //           setForm({ name: "", unit_id: "" });
  //           setPolygonCoords([]);
  //         }
  //       )
  //     ).finally(() => setEditLoading(false));
  //   } else {
  //     // Admin unit: tanpa unit_id
  //     dispatch(
  //       createUnitDetailV2(form.name, polygonCoords, () => {
  //         setForm({ name: "" });
  //         setPolygonCoords([]);
  //       })
  //     ).finally(() => setEditLoading(false));
  //   }
  // };

  // const handleDelete = (id) => {
  //   setEditLoading(true);
  //   Swal.fire({
  //     title: "Yakin hapus unit detail ini?",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "Ya, Hapus",
  //     cancelButtonText: "Batal",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       dispatch(deleteUnitDetail(id)).finally(() => setEditLoading(false));
  //     }
  //   });
  // };

  // Handler untuk mulai edit
  const handleStartEdit = async (id) => {
    setEditLoading(true);
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
      // Pastikan data valid sebelum set polygonCoords
      if (data && data.length > 0 && data[0]) {
        const unitDetail = data[0];
        const allPolygons = [];

        // Ambil semua lokasi yang ada (lokasi, lokasi2, lokasi3, dst)
        Object.keys(unitDetail).forEach((key) => {
          if (
            key.startsWith("lokasi") &&
            Array.isArray(unitDetail[key]) &&
            unitDetail[key].length > 0
          ) {
            const lokasiData = unitDetail[key];

            // Cek apakah data adalah array of coordinates (format: [[lat,lng], [lat,lng], ...])
            if (Array.isArray(lokasiData[0]) && lokasiData[0].length === 2) {
              // Format: [[lat,lng], [lat,lng], ...] - single polygon
              allPolygons.push(lokasiData);
            }
            // Cek apakah data adalah array of arrays of coordinates (format: [[[lat,lng], [lat,lng], ...], [[lat,lng], [lat,lng], ...], ...])
            else if (
              Array.isArray(lokasiData[0]) &&
              Array.isArray(lokasiData[0][0]) &&
              lokasiData[0][0].length === 2
            ) {
              // Format: [[[lat,lng], [lat,lng], ...], [[lat,lng], [lat,lng], ...], ...] - multiple polygons
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
  };

  // Handler untuk menghapus polygon
  const handleDeletePolygon = (index) => {
    // Update polygonCoords dengan array kosong untuk polygon yang dihapus
    const newPolygonCoords = [...polygonCoords];
    newPolygonCoords[index] = [];
    setPolygonCoords(newPolygonCoords);

    // Clear polygon dari map dan re-render
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      // Re-render semua polygon kecuali yang dihapus
      setTimeout(() => {
        const drawnItems = drawnItemsRef.current;

        newPolygonCoords.forEach((coords, idx) => {
          if (coords && Array.isArray(coords) && coords.length >= 3) {
            const colors = [
              { color: "#10b981", fillColor: "#10b981" }, // Hijau
              { color: "#3b82f6", fillColor: "#3b82f6" }, // Biru
              { color: "#f59e0b", fillColor: "#f59e0b" }, // Orange
              { color: "#ef4444", fillColor: "#ef4444" }, // Merah
              { color: "#8b5cf6", fillColor: "#8b5cf6" }, // Ungu
              { color: "#06b6d4", fillColor: "#06b6d4" }, // Cyan
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

  // Handler submit edit
  const handleEdit = async () => {
    setEditLoading(true);
    try {
      // Format data untuk request edit
      const requestData = {};

      // Selalu kirim lokasi (polygon pertama)
      if (polygonCoords.length > 0) {
        requestData.lokasi = polygonCoords[0];
      }

      // Kirim lokasi2 dan lokasi3 jika ada
      if (polygonCoords.length > 1) {
        requestData.lokasi2 = polygonCoords[1];
      } else {
        requestData.lokasi2 = []; // Kosongkan lokasi2 jika tidak ada
      }

      if (polygonCoords.length > 2) {
        requestData.lokasi3 = polygonCoords[2];
      } else {
        requestData.lokasi3 = []; // Kosongkan lokasi3 jika tidak ada
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
      // setEditForm({ name: "" });
      setPolygonCoords([]);
      dispatch(fetchUnitDetails());
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
      // Cek jumlah polygon yang sudah ada
      const currentLayers = drawnItems.getLayers();
      if (currentLayers.length >= 3) {
        // Hapus polygon yang baru dibuat karena sudah maksimal
        drawnItems.removeLayer(e.layer);
        Swal.fire({
          icon: "warning",
          title: "Maksimal 3 Polygon",
          text: "Anda hanya dapat membuat maksimal 3 polygon",
        });
        return;
      }

      // Tidak clear layers lagi, biarkan polygon lama tetap ada
      drawnItems.addLayer(e.layer);
      updatePolygonCoords();
    });

    // Handler saat polygon diedit
    map.on(L.Draw.Event.EDITED, function () {
      updatePolygonCoords();
    });

    // Handler saat polygon dihapus
    map.on(L.Draw.Event.DELETED, function () {
      // Gunakan updatePolygonCoords untuk memastikan state terupdate dengan benar
      setTimeout(() => {
        updatePolygonCoords();
      }, 100);
    });

    // Fungsi untuk update koordinat dari semua polygon di drawnItems
    function updatePolygonCoords() {
      const layers = drawnItems.getLayers();
      if (layers.length > 0) {
        // Ambil semua polygon, bukan hanya yang pertama
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
              // Hapus titik duplikat jika ada
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
          .filter((polygon) => polygon !== null); // Filter out null polygons

        const validPolygons = validateAndCleanPolygonData(allPolygons);
        setPolygonCoords(validPolygons);
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
    // Tambahkan delay untuk memastikan map sudah siap
    const timer = setTimeout(() => {
      try {
        if (
          !editId ||
          !Array.isArray(polygonCoords) ||
          !polygonCoords.length ||
          !mapRef.current ||
          !drawnItemsRef.current
        ) {
          return;
        }

        // Pastikan map sudah siap
        if (!mapRef.current._leaflet_map) {
          return;
        }

        const map = mapRef.current._leaflet_map;
        const drawnItems = drawnItemsRef.current;
        drawnItems.clearLayers();
        // Clear mapping
        layerIndexMapRef.current.clear();

        polygonCoords.forEach((coords, index) => {
          try {
            // Data coords adalah array of coordinates, langsung gunakan
            if (coords && Array.isArray(coords) && coords.length >= 3) {
              // Validasi koordinat
              const validCoords = coords.filter(
                (coord) =>
                  Array.isArray(coord) &&
                  coord.length === 2 &&
                  typeof coord[0] === "number" &&
                  typeof coord[1] === "number"
              );

              if (validCoords.length >= 3) {
                // Validasi koordinat lebih lanjut
                const isValidCoords = validCoords.every(
                  (coord) =>
                    coord[0] >= -90 &&
                    coord[0] <= 90 && // latitude valid
                    coord[1] >= -180 &&
                    coord[1] <= 180 && // longitude valid
                    !isNaN(coord[0]) &&
                    !isNaN(coord[1]) // bukan NaN
                );

                if (isValidCoords) {
                  try {
                    // Warna berbeda untuk setiap polygon
                    const colors = [
                      { color: "#10b981", fillColor: "#10b981" }, // Hijau
                      { color: "#3b82f6", fillColor: "#3b82f6" }, // Biru
                      { color: "#f59e0b", fillColor: "#f59e0b" }, // Orange
                      { color: "#ef4444", fillColor: "#ef4444" }, // Merah
                      { color: "#8b5cf6", fillColor: "#8b5cf6" }, // Ungu
                      { color: "#06b6d4", fillColor: "#06b6d4" }, // Cyan
                    ];

                    const colorIndex = index % colors.length;
                    const polygon = L.polygon(validCoords, {
                      color: colors[colorIndex].color,
                      fillColor: colors[colorIndex].fillColor,
                      fillOpacity: 0.2,
                    });

                    // Tambahkan popup dengan nama lokasi
                    const lokasiName =
                      index === 0 ? "Lokasi" : `Lokasi${index + 1}`;
                    polygon.bindPopup(
                      `<b>${lokasiName}</b><br>Warna: ${colors[colorIndex].color}`
                    );

                    drawnItems.addLayer(polygon);
                    // Simpan mapping layer dengan index dan tambahkan custom property
                    layerIndexMapRef.current.set(polygon, index);
                    polygon._polygonIndex = index; // Tambahkan custom property

                    // Fit bounds untuk polygon pertama atau gabungan semua
                    if (index === 0) {
                      map.fitBounds(polygon.getBounds());
                    } else {
                      // Gabungkan bounds dari semua polygon
                      const currentBounds = map.getBounds();
                      const newBounds = polygon.getBounds();
                      const combinedBounds = currentBounds.extend(newBounds);
                      map.fitBounds(combinedBounds);
                    }
                  } catch {
                    // Error handling
                  }
                }
              }
            }
          } catch {
            // Error handling
          }
        });
      } catch {
        // Error handling
      }
    }, 300); // Delay 300ms

    return () => clearTimeout(timer);
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
                        <span className="font-bold text-lg text-emerald-700 text-sm">
                          Level. {u.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <span className="material-icons text-emerald-400 text-base">
                          location_on
                        </span>
                        <span className="text-xs">{u.nama}</span>
                      </div>
                    </div>
                    <div>
                      <button
                        className="flex items-center justify-center w-8 h-8 rounded-full transition hover:bg-slate-100 focus:bg-slate-200"
                        onClick={() => {
                          handleStartEdit(u.id);
                        }}
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
                      {/* <button
                        className="flex items-center justify-center w-8 h-8 rounded-full transition hover:bg-slate-100 focus:bg-slate-200"
                        onClick={() => handleDelete(u.id)}
                        title="Hapus"
                      >
                        <span className="material-icons text-red-500 text-xl">
                          delete
                        </span>
                      </button> */}
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
              {/* {editId ? "EDIT UNIT DETAIL" : "TAMBAH UNIT DETAIL"} */}
              {editId ? "EDIT UNIT DETAIL" : ""}
            </div>
            {editId && polygonCoords.length > 0 && (
              <div className="text-sm text-gray-600 mb-2">
                <div className="mb-2">
                  Jumlah polygon: {polygonCoords.length}/3
                  {polygonCoords.length > 1 && (
                    <span className="text-xs">
                      {" "}
                      (Lokasi
                      {Array.from({ length: polygonCoords.length }, (_, i) =>
                        i === 0 ? "" : i + 1
                      ).join(", ")}
                      )
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {polygonCoords.map((polygon, index) => {
                    const colors = [
                      { color: "#10b981", name: "Hijau" }, // Hijau
                      { color: "#3b82f6", name: "Biru" }, // Biru
                      { color: "#f59e0b", name: "Orange" }, // Orange
                      { color: "#ef4444", name: "Merah" }, // Merah
                      { color: "#8b5cf6", name: "Ungu" }, // Ungu
                      { color: "#06b6d4", name: "Cyan" }, // Cyan
                    ];
                    const colorIndex = index % colors.length;
                    const color = colors[colorIndex];

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded border-l-4"
                        style={{ borderLeftColor: color.color }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color.color }}
                          ></div>
                          <span className="text-xs font-medium">
                            {index === 0 ? "Lokasi" : `Lokasi${index + 1}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({color.name})
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeletePolygon(index)}
                          className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mb-2">
              {/* {isSuperAdmin && !editId && (
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
              )} */}
              {/* <input
                className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
                placeholder="Nama Unit Detail"
                value={editId ? editForm.name : form.name}
                onChange={(e) =>
                  editId
                    ? setEditForm((f) => ({ ...f, name: e.target.value }))
                    : setForm((f) => ({ ...f, name: e.target.value }))
                }
                disabled={editLoading}
              /> */}
              {/* Map tetap di sini, polygonCoords tetap dipakai untuk create/edit */}
              <div
                ref={mapRef}
                className="w-full h-64 rounded border border-emerald-200 mb-2"
              />
              <button
                className={`px-4 py-2 ${
                  editId && "bg-yellow-500 hover:bg-yellow-600"
                  // editId
                  //   ? "bg-yellow-500 hover:bg-yellow-600"
                  //   : "bg-emerald-600 hover:bg-emerald-700"
                } text-white font-bold rounded w-full`}
                // onClick={editId ? handleEdit : handleCreate}
                onClick={editId && handleEdit}
                disabled={editLoading}
              >
                {editId
                  ? editLoading
                    ? "Menyimpan..."
                    : "Simpan Perubahan"
                  : " "}
              </button>

              {editId && (
                <button
                  className="mt-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold rounded w-full"
                  onClick={() => {
                    setEditId(null);
                    // setEditForm({ name: "" });
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
