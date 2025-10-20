import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPegawai } from "../../redux/actions/pegawaiAction";
import { fetchDinasData as fetchDinasDataAction } from "../../redux/actions/presensiAction";
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dinas() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const dinasData = useSelector((state) => state.presensi.dinasData);
  const dinasLoading = useSelector((state) => state.presensi.dinasLoading);
  const units = useSelector((state) => state.unitDetail.units);
  const pegawaiData = useSelector((state) => state.pegawai.data);
  const pegawaiLoading = useSelector((state) => state.pegawai.loading);
  const pegawaiPagination = useSelector((state) => state.pegawai.pagination);

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

  // State untuk modal edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDinas, setEditingDinas] = useState(null);
  const [editFormData, setEditFormData] = useState({
    tanggal_mulai: "",
    tanggal_selesai: "",
    keterangan: "",
    pegawai_ids: [],
  });
  const [editPegawaiPage, setEditPegawaiPage] = useState(1);
  const [editSearchPegawai, setEditSearchPegawai] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  // Effect untuk fetch pegawai saat modal edit dibuka
  useEffect(() => {
    if (showEditModal && token) {
      const isSuperAdmin = user?.role === "super_admin";
      dispatch(
        fetchPegawai(isSuperAdmin, token, editPegawaiPage, editSearchPegawai)
      );
    }
  }, [
    showEditModal,
    editPegawaiPage,
    editSearchPegawai,
    dispatch,
    token,
    user,
  ]);

  // Filter dinas berdasarkan search
  const filteredDinas = Array.isArray(dinasData)
    ? dinasData.filter((dinas) => {
        const searchLower = searchValue.toLowerCase();

        // Check keterangan
        const matchesKeterangan = dinas.keterangan
          ?.toLowerCase()
          .includes(searchLower);

        // Check pegawai_list array
        const matchesPegawai =
          dinas.pegawai_list &&
          Array.isArray(dinas.pegawai_list) &&
          dinas.pegawai_list.some((p) =>
            p?.nama?.toLowerCase().includes(searchLower)
          );

        return matchesKeterangan || matchesPegawai;
      })
    : [];

  // Group dinas by keterangan to show as one entry
  const groupedDinas = filteredDinas.reduce((acc, dinas) => {
    const key = dinas.keterangan;
    if (!acc[key]) {
      acc[key] = {
        keterangan: dinas.keterangan,
        tanggal_mulai: dinas.tanggal_mulai || dinas.tanggal,
        tanggal_selesai: dinas.tanggal_selesai || dinas.tanggal,
        pegawai_list: [],
        total_days: 0,
      };
    }

    // Handle pegawai_list array - iterate and add each pegawai individually
    if (dinas.pegawai_list && Array.isArray(dinas.pegawai_list)) {
      dinas.pegawai_list.forEach((pegawai) => {
        if (pegawai && pegawai.id) {
          const existingPegawai = acc[key].pegawai_list.find(
            (p) => p && p.id === pegawai.id
          );
          if (!existingPegawai) {
            acc[key].pegawai_list.push(pegawai);
          }
        }
      });
    }

    // Use tanggal_mulai and tanggal_selesai from the data, fallback to tanggal
    const currentStartDate = dinas.tanggal_mulai || dinas.tanggal;
    const currentEndDate = dinas.tanggal_selesai || dinas.tanggal;

    const currentStart = new Date(currentStartDate);
    const currentEnd = new Date(currentEndDate);
    const startDate = new Date(acc[key].tanggal_mulai);
    const endDate = new Date(acc[key].tanggal_selesai);

    // Only compare dates if they are valid
    if (
      !isNaN(currentStart.getTime()) &&
      !isNaN(startDate.getTime()) &&
      currentStart < startDate
    ) {
      acc[key].tanggal_mulai = currentStartDate;
    }
    if (
      !isNaN(currentEnd.getTime()) &&
      !isNaN(endDate.getTime()) &&
      currentEnd > endDate
    ) {
      acc[key].tanggal_selesai = currentEndDate;
    }
    acc[key].total_days++;
    return acc;
  }, {});

  const groupedDinasArray = Object.values(groupedDinas);

  // Fungsi untuk membuka modal edit
  const handleEditDinas = (dinas) => {
    setEditingDinas(dinas);
    setEditFormData({
      tanggal_mulai: dinas.tanggal_mulai,
      tanggal_selesai: dinas.tanggal_selesai,
      keterangan: dinas.keterangan,
      pegawai_ids:
        dinas.pegawai_list?.filter((p) => p && p.id).map((p) => p.id) || [],
    });
    setShowEditModal(true);
  };

  // Fungsi untuk menutup modal edit
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDinas(null);
    setEditFormData({
      tanggal_mulai: "",
      tanggal_selesai: "",
      keterangan: "",
      pegawai_ids: [],
    });
    setEditPegawaiPage(1);
    setEditSearchPegawai("");
  };

  // Fungsi untuk menangani checkbox pegawai di modal edit
  const handleEditPegawaiCheckbox = (pegawaiId) => {
    setEditFormData((prev) => ({
      ...prev,
      pegawai_ids: prev.pegawai_ids.includes(pegawaiId)
        ? prev.pegawai_ids.filter((id) => id !== pegawaiId)
        : [...prev.pegawai_ids, pegawaiId],
    }));
  };

  // Fungsi untuk select all pegawai di modal edit (hanya halaman saat ini)
  const handleEditSelectAllPegawai = () => {
    const currentIds = pegawaiData.map((p) => p.id);
    const allCurrentSelected = currentIds.every((id) =>
      editFormData.pegawai_ids.includes(id)
    );

    setEditFormData((prev) => {
      if (allCurrentSelected) {
        // Deselect current page
        return {
          ...prev,
          pegawai_ids: prev.pegawai_ids.filter(
            (id) => !currentIds.includes(id)
          ),
        };
      } else {
        // Select current page
        return {
          ...prev,
          pegawai_ids: [...new Set([...prev.pegawai_ids, ...currentIds])],
        };
      }
    });
  };

  // Fungsi untuk submit edit dinas
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.tanggal_mulai) {
      Swal.fire("Error", "Tanggal mulai harus diisi", "error");
      return;
    }

    if (!editFormData.tanggal_selesai) {
      Swal.fire("Error", "Tanggal selesai harus diisi", "error");
      return;
    }

    if (!editFormData.keterangan.trim()) {
      Swal.fire("Error", "Keterangan harus diisi", "error");
      return;
    }

    if (editFormData.pegawai_ids.length === 0) {
      Swal.fire("Error", "Pilih minimal satu pegawai", "error");
      return;
    }

    setEditSubmitting(true);

    try {
      // Ambil ID dinas dari data asli (bukan dari grouped data)
      const originalDinas = filteredDinas.find(
        (d) => d.keterangan === editingDinas.keterangan
      );
      const dinasId = originalDinas?.id;

      if (!dinasId) {
        Swal.fire("Error", "ID dinas tidak ditemukan", "error");
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/dinas/edit/${dinasId}`,
        {
          tanggal_mulai: editFormData.tanggal_mulai,
          tanggal_selesai: editFormData.tanggal_selesai,
          keterangan: editFormData.keterangan.trim(),
          pegawai_ids: editFormData.pegawai_ids,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        Swal.fire("Sukses", "Data dinas berhasil diperbarui", "success");
        handleCloseEditModal();
        // Refresh data dinas
        fetchDinasData(selectedTahun, selectedUnit, selectedBulan);
      } else {
        Swal.fire(
          "Error",
          response.data.message || "Gagal memperbarui data dinas",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating dinas:", error);
      Swal.fire(
        "Error",
        "Terjadi kesalahan saat memperbarui data dinas",
        "error"
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  // Fungsi untuk hapus dinas
  const handleDeleteDinas = async (dinas) => {
    // Ambil ID dinas dari data asli (bukan dari grouped data)
    const originalDinas = filteredDinas.find(
      (d) => d.keterangan === dinas.keterangan
    );
    const dinasId = originalDinas?.id;

    if (!dinasId) {
      Swal.fire("Error", "ID dinas tidak ditemukan", "error");
      return;
    }

    // Konfirmasi hapus
    const result = await Swal.fire({
      title: "Hapus Data Dinas?",
      html: `
        <div class="text-left">
          <p>Apakah Anda yakin ingin menghapus data dinas ini?</p>
          <p class="mt-2"><strong>Keterangan:</strong> ${dinas.keterangan}</p>
          <p><strong>Tanggal:</strong> ${formatDate(
            dinas.tanggal_mulai
          )} - ${formatDate(dinas.tanggal_selesai)}</p>
          <p><strong>Jumlah Pegawai:</strong> ${
            dinas.pegawai_list?.length || 0
          }</p>
          <p class="mt-2 text-red-600"><strong>Peringatan:</strong> Data yang dihapus tidak dapat dikembalikan!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/dinas/delete/${dinasId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response) {
          Swal.fire("Berhasil!", "Data dinas berhasil dihapus.", "success");
          // Refresh data dinas
          fetchDinasData(selectedTahun, selectedUnit, selectedBulan);
        } else {
          Swal.fire(
            "Error",
            response.data.message || "Gagal menghapus data dinas",
            "error"
          );
        }
      } catch (error) {
        console.error("Error deleting dinas:", error);
        Swal.fire(
          "Error",
          error.response?.data?.message ||
            "Terjadi kesalahan saat menghapus data dinas",
          "error"
        );
      }
    }
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
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
                    units.map((unit) => {
                      const level = parseInt(unit?.level) || 0;
                      const indent = "\u00A0".repeat(level * 4);

                      // Icon berdasarkan level
                      let icon = "";
                      if (level === 0) {
                        icon = "🏢"; // Building untuk level 0 (root)
                      } else if (level === 1) {
                        icon = "📁"; // Folder untuk level 1
                      } else if (level === 2) {
                        icon = "📂"; // Open folder untuk level 2
                      } else if (level === 3) {
                        icon = "📄"; // Document untuk level 3
                      } else if (level === 4) {
                        icon = "📋"; // Clipboard untuk level 4
                      } else {
                        icon = "🔗"; // Link untuk level 5+
                      }

                      return (
                        <option key={unit.id} value={unit.id}>
                          {indent}
                          {icon} {unit?.nama}
                        </option>
                      );
                    })}
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
                                {dinas.pegawai_list?.length || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center align-middle text-sm">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => {
                                    const pegawaiList =
                                      dinas.pegawai_list &&
                                      dinas.pegawai_list.length > 0
                                        ? dinas.pegawai_list
                                            .filter((p) => p && p.nama)
                                            .map((p) => {
                                              // Build full name with gelar
                                              return [
                                                p.gelar_depan,
                                                p.nama,
                                                p.gelar_belakang,
                                              ]
                                                .filter(Boolean)
                                                .join(" ");
                                            })
                                            .join(", ")
                                        : "Tidak ada data pegawai";

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
                                          <p><strong>Jumlah Pegawai:</strong> ${
                                            dinas.pegawai_list?.length || 0
                                          }</p>
                                          <p><strong>Nama Pegawai:</strong> ${pegawaiList}</p>
                                          <p><strong>Jumlah Hari:</strong> ${
                                            dinas.total_days
                                          }</p>
                                        </div>
                                      `,
                                      icon: "info",
                                      width: "600px",
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
                                  onClick={() => handleEditDinas(dinas)}
                                  className="p-1 hover:bg-emerald-100 text-emerald-600 rounded"
                                  title="Edit"
                                >
                                  <span className="material-icons text-sm">
                                    edit
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDeleteDinas(dinas)}
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

      {/* Modal Edit Dinas */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Dinas</h3>
                <button
                  onClick={handleCloseEditModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Form Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editFormData.tanggal_mulai}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          tanggal_mulai: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editFormData.tanggal_selesai}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          tanggal_selesai: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keterangan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.keterangan}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        keterangan: e.target.value,
                      }))
                    }
                    placeholder="Masukkan keterangan dinas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Pegawai Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pilih Pegawai <span className="text-red-500">*</span>
                  </label>

                  {/* Search Pegawai */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Cari pegawai..."
                      value={editSearchPegawai}
                      onChange={(e) => {
                        setEditSearchPegawai(e.target.value);
                        setEditPegawaiPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Selected Pegawai Summary */}
                  {editFormData.pegawai_ids.length > 0 && (
                    <div className="mb-4 p-3 bg-emerald-50 rounded border border-emerald-200">
                      <p className="text-sm text-emerald-700 font-semibold mb-2">
                        Pegawai yang dipilih ({editFormData.pegawai_ids.length}
                        ):
                      </p>
                      <div className="text-sm text-emerald-600">
                        {pegawaiData
                          .filter((p) =>
                            editFormData.pegawai_ids.includes(p.id)
                          )
                          .map((p) =>
                            [p.gelar_depan, p.nama, p.gelar_belakang]
                              .filter(Boolean)
                              .join(" ")
                          )
                          .join(", ")}
                      </div>
                    </div>
                  )}

                  {/* Pegawai Table */}
                  {pegawaiLoading ? (
                    <div className="text-center py-8 text-emerald-600">
                      <span className="material-icons animate-spin text-2xl mb-2">
                        refresh
                      </span>
                      <div>Memuat data pegawai...</div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-emerald-600 text-white">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold w-12">
                                <input
                                  type="checkbox"
                                  checked={
                                    pegawaiData.length > 0 &&
                                    pegawaiData.every((p) =>
                                      editFormData.pegawai_ids.includes(p.id)
                                    )
                                  }
                                  onChange={handleEditSelectAllPegawai}
                                  className="rounded"
                                />
                              </th>
                              <th className="px-3 py-2 text-left font-semibold">
                                Nama
                              </th>
                              <th className="px-3 py-2 text-left font-semibold">
                                NIK
                              </th>
                              <th className="px-3 py-2 text-left font-semibold">
                                Unit Detail
                              </th>
                              <th className="px-3 py-2 text-left font-semibold">
                                Shift
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pegawaiData.length > 0 ? (
                              pegawaiData.map((p, idx) => (
                                <tr
                                  key={p.id}
                                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  }`}
                                >
                                  <td className="px-3 py-2">
                                    <input
                                      type="checkbox"
                                      checked={editFormData.pegawai_ids.includes(
                                        p.id
                                      )}
                                      onChange={() =>
                                        handleEditPegawaiCheckbox(p.id)
                                      }
                                      className="rounded"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    {[p.gelar_depan, p.nama, p.gelar_belakang]
                                      .filter(Boolean)
                                      .join(" ")}
                                  </td>
                                  <td className="px-3 py-2">{p.no_ktp}</td>
                                  <td className="px-3 py-2">
                                    {p.nama_unit || "-"}
                                  </td>
                                  <td className="px-3 py-2">
                                    {p.nama_shift || "-"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-3 py-8 text-center text-gray-500"
                                >
                                  Tidak ada data pegawai
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {pegawaiPagination.last_page > 1 && (
                        <div className="flex flex-wrap gap-1 justify-center p-3 bg-gray-50 border-t border-gray-200">
                          {pegawaiPagination.links?.map((link, i) => (
                            <button
                              key={i}
                              type="button"
                              className={`px-3 py-1 text-xs font-bold border transition ${
                                link.active
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-100"
                              }`}
                              onClick={() => {
                                if (link.url) {
                                  const url = new URL(link.url);
                                  const p = url.searchParams.get("page");
                                  if (p) setEditPegawaiPage(Number(p));
                                }
                              }}
                              disabled={!link.url || link.active}
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Button Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition duration-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition duration-200 flex items-center gap-2"
                  >
                    {editSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
