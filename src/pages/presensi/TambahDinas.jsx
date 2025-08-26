import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPegawai } from "../../redux/actions/pegawaiAction";
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
      dispatch(fetchPegawai(isSuperAdmin, token, page, searchPegawai));
      if (isSuperAdmin) {
        dispatch(fetchAllUnit());
      }
    }
    // eslint-disable-next-line
  }, [token, user, dispatch, isSuperAdmin, page, searchPegawai]);

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
    dispatch(fetchPegawai(isSuperAdmin, token, page));
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
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <span className="material-icons text-gray-600">arrow_back</span>
        </button>
        <span className="material-icons text-green-200 bg-primary p-2 rounded opacity-80">
          business_center
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Tambah Dinas
          </div>
          <div className="text-gray-600 text-base font-medium">
            Tambah data dinas pegawai baru
          </div>
        </div>
      </div>

      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-4 px-2 md:px-0">
        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800">
              Form Tambah Dinas
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Isi form di bawah untuk menambahkan data dinas baru
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    name="tanggal_mulai"
                    value={formData.tanggal_mulai}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tanggal Selesai *
                  </label>
                  <input
                    type="date"
                    name="tanggal_selesai"
                    value={formData.tanggal_selesai}
                    onChange={handleInputChange}
                    min={formData.tanggal_mulai}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keterangan *
                </label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Masukkan keterangan dinas..."
                  required
                />
              </div>

              {/* Unit Dropdown untuk SuperAdmin */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pilih Unit
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                      units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Selected Pegawai Summary */}
                {formData.pegawai_ids.length > 0 && (
                  <div className="mb-4 p-3 bg-emerald-50 rounded border border-emerald-200">
                    <p className="text-sm text-emerald-700 font-semibold mb-2">
                      Pegawai yang dipilih ({formData.pegawai_ids.length}):
                    </p>
                    <div className="text-sm text-emerald-600">
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
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-emerald-600 text-white">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold w-12">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) =>
                                  handleSelectAll(e.target.checked)
                                }
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
                              Unit
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
                          {pegawaiList.length > 0 ? (
                            pegawaiList.map((p, idx) => (
                              <tr
                                key={p.id}
                                className={`border-b border-gray-100 hover:bg-gray-50 ${
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }`}
                              >
                                <td className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    checked={formData.pegawai_ids.includes(
                                      p.id
                                    )}
                                    onChange={() => handlePegawaiToggle(p.id)}
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
                                  {p.unit_name || "-"}
                                </td>
                                <td className="px-3 py-2">
                                  {p.unit_detail_name || "-"}
                                </td>
                                <td className="px-3 py-2">
                                  {p.shift_name || "-"}
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
                      <div className="flex flex-wrap gap-1 justify-center mt-4">
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
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/dinas")}
                  className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-400 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded hover:bg-yellow-600 transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.pegawai_ids.length === 0}
                  className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 transition disabled:opacity-50"
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
