import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPegawai2 } from "../../redux/actions/pegawaiAction";
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TambahDinas() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const pegawaiData = useSelector((state) => state.pegawai.data);
  const { pagination } = useSelector((state) => state.pegawai);
  const pegawaiLoading = useSelector((state) => state.pegawai.loading);
  const units = useSelector((state) => state.unitDetail.units);

  const [page, setPage] = useState(1);

  // State untuk form dinas
  const [formData, setFormData] = useState({
    tanggal_mulai: "",
    tanggal_selesai: "",
    keterangan: "",
    pegawai_ids: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSuperAdmin = user?.role === "super_admin";
  const [searchPegawai, setSearchPegawai] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(""); // Tambahan untuk unit superadmin

  // Fetch data saat komponen mount & saat page/search/unit berubah
  useEffect(() => {
    if (token) {
      dispatch(
        fetchPegawai2(isSuperAdmin, token, page, searchPegawai, selectedUnit)
      );
      if (isSuperAdmin) {
        dispatch(fetchAllUnit());
      }
    }
  }, [token, user, dispatch, isSuperAdmin, page, searchPegawai, selectedUnit]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/dinas/create`;

      const submitData = {
        unit_id: selectedUnit,
        tanggal_mulai: formData.tanggal_mulai,
        tanggal_selesai: formData.tanggal_selesai,
        keterangan: formData.keterangan,
        pegawai_ids: formData.pegawai_ids.map((id) => parseInt(id)),
      };

      const response = await axios.post(url, submitData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data dinas berhasil ditambahkan",
        });
        navigate("/dinas");
      } else {
        throw new Error(
          response.data?.message || "Gagal menambahkan data dinas"
        );
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Gagal menambahkan data dinas",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page) => {
    dispatch(fetchPegawai2(isSuperAdmin, token, page, "", selectedUnit));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      tanggal_mulai: "",
      tanggal_selesai: "",
      keterangan: "",
      pegawai_ids: [],
    });
    setSelectedUnit("");
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle pegawai selection
  const handlePegawaiToggle = (pegawaiId) => {
    setFormData((prev) => {
      const isSelected = prev.pegawai_ids.includes(pegawaiId);
      if (isSelected) {
        return {
          ...prev,
          pegawai_ids: prev.pegawai_ids.filter((id) => id !== pegawaiId),
        };
      } else {
        return {
          ...prev,
          pegawai_ids: [...prev.pegawai_ids, pegawaiId],
        };
      }
    });
  };

  // Get selected pegawai names for display
  const getSelectedPegawaiNames = () => {
    const allPegawai = Array.isArray(pegawaiData?.data)
      ? pegawaiData.data
      : Array.isArray(pegawaiData)
      ? pegawaiData
      : [];
    return formData.pegawai_ids
      .map((id) => {
        const pegawai = allPegawai.find((p) => p.id == id);
        return pegawai
          ? [pegawai.gelar_depan, pegawai.nama, pegawai.gelar_belakang]
              .filter(Boolean)
              .join(" ")
          : "";
      })
      .filter(Boolean);
  };

  // Data pegawai untuk table (support laravel pagination)
  const pegawaiList = Array.isArray(pegawaiData?.data)
    ? pegawaiData.data
    : Array.isArray(pegawaiData)
    ? pegawaiData
    : [];

  // Select all on current page
  const handleSelectAll = (checked) => {
    const currentIds = pegawaiList.map((p) => p.id);
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          pegawai_ids: [...new Set([...prev.pegawai_ids, ...currentIds])],
        };
      } else {
        return {
          ...prev,
          pegawai_ids: prev.pegawai_ids.filter(
            (id) => !currentIds.includes(id)
          ),
        };
      }
    });
  };

  // Check if all on current page selected
  const allSelected =
    pegawaiList.length > 0 &&
    pegawaiList.every((p) => formData.pegawai_ids.includes(p.id));

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 transition"
        >
          <span className="material-icons text-gray-600">arrow_back</span>
        </button>
        <div className="bg-emerald-600 p-2">
          <span className="material-icons text-white">business_center</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-800 tracking-tight uppercase">
            Tambah Dinas
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Tambah data dinas pegawai baru
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-7xl flex flex-col gap-6">
        {/* Form Card */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-emerald-600">
                  edit_calendar
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Form Tambah Dinas
                </h3>
                <p className="text-emerald-100 text-xs font-medium">
                  Isi form untuk menambahkan data dinas baru
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    name="tanggal_mulai"
                    value={formData.tanggal_mulai}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                    Tanggal Selesai *
                  </label>
                  <input
                    type="date"
                    name="tanggal_selesai"
                    value={formData.tanggal_selesai}
                    onChange={handleInputChange}
                    min={formData.tanggal_mulai}
                    className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                  Keterangan *
                </label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                  placeholder="Masukkan keterangan dinas..."
                  required
                />
              </div>

              {/* Unit Dropdown untuk SuperAdmin */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
                    Pilih Unit
                  </label>
                  <select
                    className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                    value={selectedUnit}
                    onChange={(e) => {
                      setSelectedUnit(e.target.value);
                      setPage(1);
                      setFormData((prev) => ({
                        ...prev,
                        pegawai_ids: [],
                      }));
                    }}
                  >
                    <option value="">Semua Unit</option>
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
                          icon = "🧾"; // Link untuk level 5+
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

              {/* Pegawai Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilih Pegawai *
                </label>

                {/* Search Pegawai */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Cari pegawai..."
                    value={searchPegawai}
                    onChange={(e) => {
                      setSearchPegawai(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Selected Pegawai Summary */}
                {formData.pegawai_ids.length > 0 && (
                  <div className="mb-4 p-3 bg-emerald-50 border-2 border-emerald-200">
                    <p className="text-sm text-emerald-800 font-bold mb-2">
                      Pegawai yang dipilih ({formData.pegawai_ids.length}):
                    </p>
                    <div className="text-sm text-emerald-700">
                      {getSelectedPegawaiNames().join(", ")}
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
                  <div className="bg-white border-2 border-emerald-200 shadow-lg">
                    <div className="px-4 py-3 bg-emerald-50 border-b-2 border-emerald-200 flex items-center gap-2">
                      <span className="material-icons text-emerald-600">
                        group
                      </span>
                      <span className="text-emerald-800 font-black text-sm uppercase tracking-wide">
                        Daftar Pegawai
                      </span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="min-w-full text-sm bg-white">
                        <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                          <tr>
                            <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-12">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) =>
                                  handleSelectAll(e.target.checked)
                                }
                                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500 focus:ring-2"
                              />
                            </th>
                            <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                              Nama
                            </th>
                            <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                              NIK
                            </th>
                            <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                              Unit Detail
                            </th>
                            <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider">
                              Shift
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pegawaiList.length > 0 ? (
                            pegawaiList.map((p, idx) => (
                              <tr
                                key={p.id}
                                className={`border-b border-emerald-100 hover:bg-emerald-50 ${
                                  idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                                }`}
                              >
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.pegawai_ids.includes(
                                      p.id
                                    )}
                                    onChange={() => handlePegawaiToggle(p.id)}
                                    className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500 focus:ring-2"
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
                                {/* <td className="px-3 py-2">
                                  {p.nama_unit_detail || "-"}
                                </td> */}
                                <td className="px-3 py-2">
                                  {p.nama_shift || "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
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
                    {pagination.last_page > 1 && (
                      <div className="flex flex-wrap gap-1 justify-center p-4 pt-0">
                        {pagination.links.map((link, i) => (
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
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={() => navigate("/dinas")}
                  className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.pegawai_ids.length === 0}
                  className="px-6 py-2 bg-emerald-600 text-white font-bold border-2 border-emerald-700 hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
