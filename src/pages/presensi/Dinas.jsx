import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPegawai } from "../../redux/actions/pegawaiAction";
import { fetchDinasData as fetchDinasDataAction } from "../../redux/actions/presensiAction";
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Dinas() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const dinasData = useSelector((state) => state.presensi.dinasData);
  const dinasLoading = useSelector((state) => state.presensi.dinasLoading);
  const units = useSelector((state) => state.unitDetail.units);

  // State untuk filter
  const [searchValue, setSearchValue] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedTahun, setSelectedTahun] = useState(
    new Date().getFullYear().toString()
  );
  // Otomatis bulan hari ini (1-12 string)
  const [selectedBulan, setSelectedBulan] = useState(
    (new Date().getMonth() + 1).toString()
  );
  // State untuk trigger fetch dinas superadmin
  const [showDinas, setShowDinas] = useState(user?.role !== "super_admin");
  const [unitWarning, setUnitWarning] = useState(""); // Untuk warning jika unit belum dipilih

  // Fetch data pegawai dan unit saat mount
  useEffect(() => {
    if (token) {
      dispatch(fetchPegawai(user?.role === "super_admin", token));
      if (user?.role === "super_admin") {
        dispatch(fetchAllUnit());
      }
      // Untuk non super_admin, langsung fetch dinas
      if (user?.role !== "super_admin" && selectedUnit) {
        fetchDinasData(selectedTahun, selectedUnit, selectedBulan);
      }
    }
    // eslint-disable-next-line
  }, [token, user, dispatch]);

  // Fetch data dinas dengan filter
  const fetchDinasData = (tahun, unit_id, bulan) => {
    const params = new URLSearchParams();
    if (tahun) params.append("tahun", tahun);
    if (bulan) params.append("bulan", bulan);
    if (user?.role === "super_admin" && unit_id) {
      params.append("unit_id", unit_id);
    }
    dispatch(fetchDinasDataAction(params.toString()));
  };

  // Effect untuk refetch data ketika filter berubah (hanya jika showDinas true)
  useEffect(() => {
    if (token && showDinas) {
      fetchDinasData(selectedTahun, selectedUnit, selectedBulan);
    }
    // eslint-disable-next-line
  }, [selectedTahun, selectedUnit, selectedBulan, showDinas]);

  // Filter dinas berdasarkan search
  const filteredDinas = Array.isArray(dinasData)
    ? dinasData.filter((dinas) => {
        const matchesSearch =
          dinas.keterangan?.toLowerCase().includes(searchValue.toLowerCase()) ||
          dinas.pegawai?.nama
            ?.toLowerCase()
            .includes(searchValue.toLowerCase());
        return matchesSearch;
      })
    : [];

  // Group dinas by keterangan to show as one entry
  const groupedDinas = filteredDinas.reduce((acc, dinas) => {
    const key = dinas.keterangan;
    if (!acc[key]) {
      acc[key] = {
        keterangan: dinas.keterangan,
        tanggal_mulai: dinas.tanggal,
        tanggal_selesai: dinas.tanggal,
        pegawai_list: [],
        total_days: 0,
      };
    }
    const existingPegawai = acc[key].pegawai_list.find(
      (p) => p.id === dinas.pegawai.id
    );
    if (!existingPegawai) {
      acc[key].pegawai_list.push(dinas.pegawai);
    }
    const currentDate = new Date(dinas.tanggal);
    const startDate = new Date(acc[key].tanggal_mulai);
    const endDate = new Date(acc[key].tanggal_selesai);
    if (currentDate < startDate) {
      acc[key].tanggal_mulai = dinas.tanggal;
    }
    if (currentDate > endDate) {
      acc[key].tanggal_selesai = dinas.tanggal;
    }
    acc[key].total_days++;
    return acc;
  }, {});

  const groupedDinasArray = Object.values(groupedDinas);

  // Format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate tahun options (5 tahun ke belakang dan 2 tahun ke depan)
  const generateTahunOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  };

  // Daftar bulan
  const bulanList = [
    { value: "", label: "Semua Bulan" },
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  // --- FIX: Enable unit select even when showDinas === false (superadmin) ---
  // Only disable tahun & search, not unit select
  const isUnitSelectDisabled = false;
  const isOtherFilterDisabled = user?.role === "super_admin" && !showDinas;

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-green-200 bg-primary p-2 rounded opacity-80">
          business_center
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Manajemen Dinas
          </div>
          <div className="text-gray-600 text-base font-medium">
            Kelola data dinas pegawai
          </div>
        </div>
      </div>

      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-4 px-2 md:px-0">
        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dinas/tambah")}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center gap-2"
            >
              <span className="material-icons text-base">add</span>
              Tambah Dinas
            </button>
          </div>

          {/* Filter Section */}
          <div className="flex gap-2 items-center">
            {/* Tahun Filter */}
            <div className="flex flex-col min-w-[100px]">
              <label className="text-xs font-semibold text-gray-600 mb-1">
                Tahun
              </label>
              <select
                className="border border-gray-300 px-2 py-1 text-xs rounded"
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                disabled={isOtherFilterDisabled}
              >
                {generateTahunOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulan Filter */}
            <div className="flex flex-col min-w-[100px]">
              <label className="text-xs font-semibold text-gray-600 mb-1">
                Bulan
              </label>
              <select
                className="border border-gray-300 px-2 py-1 text-xs rounded"
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
                disabled={isOtherFilterDisabled}
              >
                {bulanList.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Filter (hanya untuk super_admin) */}
            {user?.role === "super_admin" && (
              <div className="flex flex-col min-w-[120px]">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Unit
                </label>
                <select
                  className="border border-gray-300 px-2 py-1 text-xs rounded"
                  value={selectedUnit}
                  onChange={(e) => {
                    setSelectedUnit(e.target.value);
                    setUnitWarning(""); // reset warning saat pilih unit
                  }}
                  disabled={isUnitSelectDisabled}
                >
                  <option value="">Pilih Unit</option>
                  {Array.isArray(units) &&
                    units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u?.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Search Filter */}
            <div className="flex flex-col min-w-[200px]">
              <label className="text-xs font-semibold text-gray-600 mb-1">
                Cari
              </label>
              <input
                type="text"
                placeholder="Cari dinas..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="border border-gray-300 px-2 py-1 text-xs rounded"
                disabled={isOtherFilterDisabled}
              />
            </div>
          </div>
        </div>

        {/* Tombol tampilkan data untuk super_admin */}
        {user?.role === "super_admin" && !showDinas && (
          <div className="flex flex-col items-center my-8 gap-2">
            <button
              className="px-6 py-3 bg-emerald-600 text-white font-bold rounded shadow hover:bg-emerald-700 transition flex items-center gap-2 text-lg"
              onClick={() => {
                if (!selectedUnit) {
                  setUnitWarning("Silakan pilih unit terlebih dahulu.");
                } else {
                  setUnitWarning("");
                  setShowDinas(true);
                }
              }}
            >
              <span className="material-icons">visibility</span>
              Tampilkan Data Dinas
            </button>
            {unitWarning && (
              <span className="text-red-600 text-sm font-semibold">
                {unitWarning}
              </span>
            )}
          </div>
        )}

        {/* Data Table */}
        {(user?.role !== "super_admin" || showDinas) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                Data Dinas Pegawai
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Daftar semua data dinas pegawai
              </p>
            </div>

            {dinasLoading ? (
              <div className="text-center py-12 text-emerald-600 font-bold flex items-center justify-center gap-2">
                <span className="material-icons animate-spin">refresh</span>
                Memuat data dinas...
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center px-6 pt-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span className="material-icons">description</span>
                    <span className="font-semibold">
                      Total Data: {groupedDinasArray.length} records
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto border border-gray-200 shadow-sm">
                  <table className="min-w-full text-xs">
                    <thead className="bg-emerald-600 text-white">
                      <tr>
                        <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-16">
                          NO
                        </th>
                        <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-32">
                          TANGGAL MULAI
                        </th>
                        <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-32">
                          TANGGAL SELESAI
                        </th>
                        <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-48">
                          KETERANGAN
                        </th>
                        <th className="px-3 py-3 text-center font-bold text-sm border-r border-emerald-500 w-32">
                          JUMLAH PEGAWAI
                        </th>
                        <th className="px-3 py-3 text-center font-bold text-sm w-24">
                          AKSI
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedDinasArray.length > 0 ? (
                        groupedDinasArray.map((dinas, idx) => (
                          <tr
                            key={idx}
                            className={`transition hover:bg-emerald-50 border-b border-gray-100 ${
                              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200 font-semibold">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                              {formatDate(dinas.tanggal_mulai)}
                            </td>
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                              {formatDate(dinas.tanggal_selesai)}
                            </td>
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                              {dinas.keterangan}
                            </td>
                            <td className="px-3 py-3 text-center align-middle text-sm border-r border-gray-200">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                                {dinas.pegawai_list.length}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center align-middle text-sm">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => {
                                    const pegawaiList = dinas.pegawai_list
                                      .map((p) => p.nama)
                                      .join(", ");
                                    Swal.fire({
                                      title: "Detail Dinas",
                                      html: `
                                        <div class="text-left">
                                          <p><strong>Keterangan:</strong> ${
                                            dinas.keterangan
                                          }</p>
                                          <p><strong>Tanggal:</strong> ${formatDate(
                                            dinas.tanggal_mulai
                                          )} - ${formatDate(
                                        dinas.tanggal_selesai
                                      )}</p>
                                          <p><strong>Pegawai:</strong> ${pegawaiList}</p>
                                          <p><strong>Jumlah Hari:</strong> ${
                                            dinas.total_days
                                          }</p>
                                        </div>
                                      `,
                                      icon: "info",
                                    });
                                  }}
                                  className="p-1 hover:bg-blue-100 text-blue-600 rounded"
                                  title="Lihat Detail"
                                >
                                  <span className="material-icons text-sm">
                                    visibility
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    Swal.fire({
                                      title: "Edit Dinas",
                                      text: "Fitur edit akan segera tersedia",
                                      icon: "info",
                                    });
                                  }}
                                  className="p-1 hover:bg-emerald-100 text-emerald-600 rounded"
                                  title="Edit"
                                >
                                  <span className="material-icons text-sm">
                                    edit
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    Swal.fire({
                                      title: "Hapus Dinas",
                                      text: "Fitur hapus akan segera tersedia",
                                      icon: "info",
                                    });
                                  }}
                                  className="p-1 hover:bg-red-100 text-red-600 rounded"
                                  title="Hapus"
                                >
                                  <span className="material-icons text-sm">
                                    delete
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-3 py-8 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <span className="material-icons text-4xl text-gray-300">
                                business_center
                              </span>
                              <span className="font-semibold text-gray-400">
                                Tidak ada data
                              </span>
                              <span className="text-sm text-gray-400">
                                Belum ada data dinas yang tersedia
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
  