import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPegawai } from "../../redux/actions/pegawaiAction";
import axios from "axios";
import Swal from "sweetalert2";

export default function SettingPresensi() {
  const dispatch = useDispatch();
  const { token, isSuperAdmin } = useSelector((state) => state.auth);
  const {
    data: pegawaiData,
    loading,
    pagination,
  } = useSelector((state) => state.pegawai);

  const [selectedPegawai, setSelectedPegawai] = useState([]);
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchPegawai(isSuperAdmin, token, currentPage, searchValue));
    }
  }, [dispatch, token, isSuperAdmin, currentPage, searchValue]);

  const handleCheckboxChange = (pegawaiId) => {
    setSelectedPegawai((prev) => {
      if (prev.includes(pegawaiId)) {
        return prev.filter((id) => id !== pegawaiId);
      } else {
        return [...prev, pegawaiId];
      }
    });
  };

  const handleSelectAll = () => {
    const currentIds = pegawaiData.map((p) => p.id);
    const allCurrentSelected = currentIds.every((id) =>
      selectedPegawai.includes(id)
    );

    if (allCurrentSelected) {
      // Deselect current page
      setSelectedPegawai((prev) =>
        prev.filter((id) => !currentIds.includes(id))
      );
    } else {
      // Select current page
      setSelectedPegawai((prev) => [...new Set([...prev, ...currentIds])]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tanggal) {
      Swal.fire("Error", "Tanggal harus diisi", "error");
      return;
    }

    if (selectedPegawai.length === 0) {
      Swal.fire("Error", "Pilih minimal satu pegawai", "error");
      return;
    }

    if (!keterangan.trim()) {
      Swal.fire("Error", "Keterangan harus diisi", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/presensi/admin-presensi-pegawai`,
        {
          tanggal,
          keterangan: keterangan.trim(),
          pegawai_ids: selectedPegawai,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response) {
        Swal.fire("Sukses", "Presensi pegawai berhasil disimpan", "success");
        setTanggal("");
        setKeterangan("");
        setSelectedPegawai([]);
      } else {
        Swal.fire(
          "Error",
          response.data.message || "Gagal menyimpan presensi",
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting presensi:", error);
      Swal.fire("Error", "Terjadi kesalahan saat menyimpan presensi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Don't reset selection when changing page (multi-page selection)
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Pengaturan Presensi Admin
        </h2>
        <p className="text-gray-600">
          Admin dapat mengabsenkan pegawai yang tidak bisa absen karena alasan
          teknis
        </p>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Presensi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: HP rusak, aplikasi error, dll"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {tanggal && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Tanggal yang dipilih:</strong> {formatDate(tanggal)}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || selectedPegawai.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded transition duration-200 flex items-center gap-2"
        >
          {submitting ? (
            <>
              <span className="material-icons animate-spin text-base">
                refresh
              </span>
              Menyimpan...
            </>
          ) : (
            `Simpan Presensi (${selectedPegawai.length} pegawai)`
          )}
        </button>
      </form>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setCurrentPage(1); // Reset to page 1 when searching
          }}
          placeholder="Cari pegawai berdasarkan nama atau NIK..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Pegawai List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Daftar Pegawai
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedPegawai.length} pegawai dipilih
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
              >
                {pegawaiData.length > 0 &&
                pegawaiData.every((p) => selectedPegawai.includes(p.id))
                  ? "Batal Pilih Halaman Ini"
                  : "Pilih Semua Halaman Ini"}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-emerald-600">
            <span className="material-icons animate-spin text-2xl mb-2">
              refresh
            </span>
            <div>Memuat data pegawai...</div>
          </div>
        ) : pegawaiData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Tidak ada data pegawai ditemukan</p>
          </div>
        ) : (
          <>
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
                            selectedPegawai.includes(p.id)
                          )
                        }
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">NIK</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Nama Pegawai
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">Unit</th>
                    <th className="px-3 py-2 text-left font-semibold">Shift</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pegawaiData.map((pegawai, idx) => (
                    <tr
                      key={pegawai.id}
                      className={`border-b border-gray-100 hover:bg-emerald-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedPegawai.includes(pegawai.id)}
                          onChange={() => handleCheckboxChange(pegawai.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-3 py-2">{pegawai.no_ktp}</td>
                      <td className="px-3 py-2">
                        {[
                          pegawai.gelar_depan,
                          pegawai.nama,
                          pegawai.gelar_belakang,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </td>
                      <td className="px-3 py-2">{pegawai.nama_unit || "-"}</td>
                      <td className="px-3 py-2">{pegawai.nama_shift || "-"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${
                            selectedPegawai.includes(pegawai.id)
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedPegawai.includes(pegawai.id)
                            ? "Dipilih"
                            : "Belum Dipilih"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex flex-wrap gap-1 justify-center p-3 bg-gray-50 border-t border-gray-200">
                {pagination.links?.map((link, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 text-xs font-bold border transition ${
                      link.active
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      if (link.url) {
                        const url = new URL(link.url);
                        const p = url.searchParams.get("page");
                        if (p) handlePageChange(Number(p));
                      }
                    }}
                    disabled={!link.url || link.active}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
