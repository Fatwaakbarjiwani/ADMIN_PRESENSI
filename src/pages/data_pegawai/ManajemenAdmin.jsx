import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../redux/actions/adminAction";
import { fetchAllUnit } from "../../redux/actions/unitDetailAction";
import {
  createUnit,
  updateUnit,
  deleteUnit,
} from "../../redux/actions/unitAction";

export default function ManajemenAdmin() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.admin);
  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    role: "admin_unit",
    unit_id: "",
    status: "aktif",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [filterUnit, setFilterUnit] = useState("");
  const units = useSelector((state) => state.unitDetail.units);
  const [showPassword, setShowPassword] = useState(false);

  // Unit management state
  const [unitForm, setUnitForm] = useState({
    id: null,
    name: "",
  });
  const [unitFormLoading, setUnitFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("admin"); // "admin" or "unit"

  useEffect(() => {
    if (user || formLoading == false || unitFormLoading == false) {
      dispatch(fetchAdmin());
      dispatch(fetchAllUnit());
    }
  }, [user, dispatch, formLoading, unitFormLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    const body = { ...form };
    if (!form.id) delete body.id;
    if (form.id) {
      dispatch(
        updateAdmin(
          form.id,
          body,
          () => {
            setForm({
              id: null,
              name: "",
              email: "",
              password: "",
              role: "admin_unit",
              unit_id: "",
              status: "aktif",
            });
            setFormLoading(false);
            Swal.fire({
              icon: "success",
              title: "Berhasil update admin",
              timer: 1200,
              showConfirmButton: false,
            });
          },
          (err) => {
            let msg = "Gagal menyimpan data admin";
            if (
              err.response &&
              (err.response.data?.message || err.response.data?.errors)
            ) {
              if (err.response.data.errors) {
                msg = Object.values(err.response.data.errors).flat().join("\n");
              } else {
                msg = err.response.data.message;
              }
            }
            Swal.fire({ icon: "error", title: "Validasi Gagal", text: msg });
            setFormLoading(false);
          }
        )
      );
    } else {
      dispatch(
        createAdmin(
          body,
          () => {
            setForm({
              id: null,
              name: "",
              email: "",
              password: "",
              role: "admin_unit",
              unit_id: "",
              status: "aktif",
            });
            setFormLoading(false);
            Swal.fire({
              icon: "success",
              title: "Berhasil tambah admin",
              timer: 1200,
              showConfirmButton: false,
            });
          },
          (err) => {
            let msg = "Gagal menyimpan data admin";
            if (
              err.response &&
              (err.response.data?.message || err.response.data?.errors)
            ) {
              if (err.response.data.errors) {
                msg = Object.values(err.response.data.errors).flat().join("\n");
              } else {
                msg = err.response.data.message;
              }
            }
            Swal.fire({ icon: "error", title: "Validasi Gagal", text: msg });
            setFormLoading(false);
          }
        )
      );
    }
  };

  const handleEdit = (row) => {
    setForm({
      id: row.id,
      name: row.name,
      email: row.email,
      password: "",
      role: row.role,
      unit_id: row.unit_id,
      status: row.status,
    });
  };

  const handleDelete = (id) => {
    if (!id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "ID admin tidak valid",
      });
      return;
    }

    Swal.fire({
      title: "Yakin hapus admin ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setFormLoading(true);
        dispatch(
          deleteAdmin(
            id,
            () => {
              setFormLoading(false);
              Swal.fire({
                icon: "success",
                title: "Admin berhasil dihapus",
                timer: 1200,
                showConfirmButton: false,
              });
            },
            (err) => {
              setFormLoading(false);
              Swal.fire({ icon: "error", title: "Gagal menghapus admin" });
              return err;
            }
          )
        );
      }
    });
  };

  // Unit management functions
  const handleUnitSubmit = (e) => {
    e.preventDefault();
    setUnitFormLoading(true);
    const body = { name: unitForm.name };
    if (unitForm.id) {
      // Update unit
      dispatch(updateUnit(unitForm.id, body)).finally(() => {
        setUnitFormLoading(false);
      });
    } else {
      // Tambah unit baru
      dispatch(
        createUnit(
          body,
          () => {
            setUnitForm({ id: null, name: "" });
            setUnitFormLoading(false);
            Swal.fire({
              icon: "success",
              title: "Berhasil tambah unit",
              timer: 1200,
              showConfirmButton: false,
            });
          },
          (err) => {
            let msg = "Gagal menyimpan data unit";
            if (
              err.response &&
              (err.response.data?.message || err.response.data?.errors)
            ) {
              if (err.response.data.errors) {
                msg = Object.values(err.response.data.errors).flat().join("\n");
              } else {
                msg = err.response.data.message;
              }
            }
            Swal.fire({ icon: "error", title: "Validasi Gagal", text: msg });
            setUnitFormLoading(false);
          }
        )
      );
    }
  };

  const handleUnitEdit = (row) => {
    setUnitForm({
      id: row.id,
      name: row.name,
    });
  };

  const handleUnitDelete = (id) => {
    if (!id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "ID unit tidak valid",
      });
      return;
    }

    Swal.fire({
      title: "Yakin hapus unit ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setUnitFormLoading(true);
        dispatch(deleteUnit(id)).finally(() => {
          setUnitFormLoading(false);
        });
      }
    });
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-emerald-50 text-2xl bg-emerald-600 rounded p-2 shadow">
          admin_panel_settings
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Menejemen Admin & Unit
          </div>
          <div className="text-gray-600 text-base font-medium">
            Kelola data admin unit dan unit
          </div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white shadow-sm">
          <button
            className={`px-6 py-3 font-semibold text-sm transition-colors ${
              activeTab === "admin"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("admin")}
          >
            <span className="material-icons text-lg mr-2">
              admin_panel_settings
            </span>
            Admin Unit
          </button>
          <button
            className={`px-6 py-3 font-semibold text-sm transition-colors ${
              activeTab === "unit"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("unit")}
          >
            <span className="material-icons text-lg mr-2">business</span>
            Unit
          </button>
        </div>

        {/* Admin Tab */}
        {activeTab === "admin" && (
          <div className="border border-gray-200 bg-white p-6 shadow flex flex-col gap-4">
            <div className="font-bold text-emerald-600 text-xl flex items-center gap-2 mb-2">
              <span className="material-icons text-emerald-600 text-2xl">
                admin_panel_settings
              </span>
              DATA ADMIN UNIT
            </div>
            <form
              className="flex flex-wrap gap-4 mb-4 items-end"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col flex-1 min-w-[160px]">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Nama
                </label>
                <input
                  className="border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Nama"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  disabled={formLoading}
                  required
                />
              </div>
              <div className="flex flex-col flex-1 min-w-[160px]">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Email
                </label>
                <input
                  className="border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  disabled={formLoading}
                  required
                />
              </div>
              <div className="flex flex-col flex-1 min-w-[120px] relative">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Password
                </label>
                <input
                  className="border border-gray-300 px-3 py-2 text-sm pr-10"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  disabled={formLoading}
                  required={!form.id}
                />
                <button
                  type="button"
                  className="absolute right-2 top-7 text-gray-400 hover:text-emerald-600"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ background: "none", border: "none", padding: 0 }}
                  title={
                    showPassword ? "Sembunyikan Password" : "Tampilkan Password"
                  }
                >
                  <span className="material-icons text-lg">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <div className="flex flex-col min-w-[120px]">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Unit
                </label>
                <select
                  className="border border-gray-300 px-3 py-2 text-sm"
                  value={form.unit_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit_id: e.target.value }))
                  }
                  disabled={formLoading}
                  required
                >
                  <option value="">Pilih Unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col min-w-[100px]">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Status
                </label>
                <select
                  className="border border-gray-300 px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                  disabled={formLoading}
                  required
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="flex flex-col justify-end min-w-[120px]">
                <button
                  type="submit"
                  className={`px-4 py-2 font-bold text-sm transition flex items-center gap-2 ${
                    form.id
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                  disabled={formLoading}
                >
                  {formLoading && (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  )}
                  {form.id
                    ? formLoading
                      ? "Menyimpan..."
                      : "Simpan Perubahan"
                    : formLoading
                    ? "Menambah..."
                    : "Tambah"}
                </button>
              </div>
              {form.id && (
                <div className="flex flex-col justify-end min-w-[80px]">
                  <button
                    type="button"
                    className="px-4 py-2 font-bold text-sm bg-gray-300 hover:bg-gray-400 text-gray-700"
                    onClick={() =>
                      setForm({
                        id: null,
                        name: "",
                        email: "",
                        password: "",
                        role: "admin_unit",
                        unit_id: "",
                        status: "aktif",
                      })
                    }
                    disabled={formLoading}
                  >
                    Batal
                  </button>
                </div>
              )}
            </form>
            {form.id && (
              <div className="mb-2 text-sm text-yellow-700 font-semibold">
                Edit Admin: {form.name} ({form.email})
              </div>
            )}
            <div className="overflow-x-auto">
              {/* Legend di atas tabel, lebih menarik */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded">
                  <label className="text-xs font-semibold text-gray-600">
                    Filter Unit:
                  </label>
                  <select
                    className="border border-gray-300 px-3 py-1 text-sm min-w-[160px]"
                    value={filterUnit}
                    onChange={(e) => setFilterUnit(e.target.value)}
                  >
                    <option value="">Semua Unit</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded">
                    <span className="material-icons text-pink-600 text-xl">
                      verified_user
                    </span>
                    <span className="text-xs text-pink-600">Super Admin</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded">
                    <span className="material-icons text-yellow-500 text-xl">
                      person
                    </span>
                    <span className="text-xs text-yellow-500">Admin Unit</span>
                  </div>
                </div>
              </div>
              <table className="min-w-full text-sm bg-white">
                <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                  <tr>
                    <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-12">
                      No
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                      Nama
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                      Email
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-24">
                      Role
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                      Unit
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-24">
                      Status
                    </th>
                    <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-24">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(filterUnit
                    ? data.filter(
                        (row) => String(row.unit_id) === String(filterUnit)
                      )
                    : data
                  ).length > 0 ? (
                    (filterUnit
                      ? data.filter(
                          (row) => String(row.unit_id) === String(filterUnit)
                        )
                      : data
                    ).map((row, idx) => (
                      <tr
                        key={`admin-${row?.id || idx}`}
                        className={
                          "transition hover:bg-emerald-50 " +
                          (idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                        }
                      >
                        <td className="px-4 py-4 text-center align-middle border-b border-gray-100 font-semibold text-base">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-base">
                          {row.name}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 text-base">
                          {row.email}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 text-base text-center">
                          {row.role === "super_admin" ? (
                            <span
                              className="material-icons text-pink-600 text-2xl"
                              title="Super Admin"
                            >
                              verified_user
                            </span>
                          ) : (
                            <span
                              className="material-icons text-yellow-500 text-2xl"
                              title="Admin Unit"
                            >
                              person
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 text-base">
                          {row.unit?.name || "-"}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 text-base font-bold">
                          {row.status === "aktif" ? (
                            <span className="text-emerald-700">Aktif</span>
                          ) : (
                            <span className="text-red-700">Nonaktif</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center align-middle border-b border-gray-100 flex gap-1 justify-center text-base">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-yellow-600 hover:text-yellow-800 rounded transition"
                            onClick={() => row && handleEdit(row)}
                            disabled={formLoading}
                            title="Edit"
                          >
                            <span className="material-icons text-base">
                              edit
                            </span>
                          </button>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 rounded transition"
                            onClick={() => handleDelete(row?.id)}
                            disabled={formLoading}
                            title="Hapus"
                          >
                            <span className="material-icons text-base">
                              delete
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-gray-400 py-4"
                      >
                        Tidak ada data admin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Unit Tab */}
        {activeTab === "unit" && (
          <div className="border border-gray-200 bg-white p-6 shadow flex flex-col gap-4">
            <div className="font-bold text-emerald-600 text-xl flex items-center gap-2 mb-2">
              <span className="material-icons text-emerald-600 text-2xl">
                business
              </span>
              DATA UNIT
            </div>
            <form
              className="flex flex-wrap gap-4 mb-4 items-end"
              onSubmit={handleUnitSubmit}
            >
              <div className="flex flex-col flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Nama Unit
                </label>
                <input
                  className="border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Nama Unit"
                  value={unitForm?.name || ""}
                  onChange={(e) =>
                    setUnitForm((f) => ({ ...f, name: e.target.value }))
                  }
                  disabled={unitFormLoading}
                  required
                />
              </div>
              <div className="flex flex-col justify-end min-w-[120px]">
                <button
                  type="submit"
                  className={`px-4 py-2 font-bold text-sm transition flex items-center gap-2 ${
                    unitForm.id
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                  disabled={unitFormLoading}
                >
                  {unitFormLoading && (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  )}
                  {unitForm.id
                    ? unitFormLoading
                      ? "Menyimpan..."
                      : "Simpan Perubahan"
                    : unitFormLoading
                    ? "Menambah..."
                    : "Tambah"}
                </button>
              </div>
              {unitForm.id && (
                <div className="flex flex-col justify-end min-w-[80px]">
                  <button
                    type="button"
                    className="px-4 py-2 font-bold text-sm bg-gray-300 hover:bg-gray-400 text-gray-700"
                    onClick={() =>
                      setUnitForm({
                        id: null,
                        name: "",
                      })
                    }
                    disabled={unitFormLoading}
                  >
                    Batal
                  </button>
                </div>
              )}
            </form>
            {unitForm.id && (
              <div className="mb-2 text-sm text-yellow-700 font-semibold">
                Edit Unit: {unitForm?.name || ""}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm bg-white">
                <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                  <tr>
                    <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-12">
                      No
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase">
                      Nama Unit
                    </th>
                    <th className="px-4 py-4 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase">
                      Detail Unit
                    </th>
                    <th className="px-4 py-4 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-24">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {units ? (
                    units.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          "transition hover:bg-emerald-50 " +
                          (idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                        }
                      >
                        <td className="px-4 py-4 text-center align-middle border-b border-gray-100 font-semibold text-base">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 font-bold text-emerald-800 text-base">
                          {row?.name}
                        </td>
                        <td className="px-4 py-4 align-middle border-b border-gray-100 text-base">
                          {row?.unit_details?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {row?.unit_details?.map((detail) => (
                                <span
                                  key={detail?.id || Math.random()}
                                  className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded"
                                >
                                  {detail?.name || "Unknown"}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              Tidak ada detail
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center align-middle border-b border-gray-100 flex gap-1 justify-center text-base">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-yellow-600 hover:text-yellow-800 rounded transition"
                            onClick={() => handleUnitEdit(row)}
                            disabled={unitFormLoading}
                            title="Edit"
                          >
                            <span className="material-icons text-base">
                              edit
                            </span>
                          </button>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 rounded transition"
                            onClick={() => handleUnitDelete(row?.id)}
                            disabled={unitFormLoading}
                            title="Hapus"
                          >
                            <span className="material-icons text-base">
                              delete
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-gray-400 py-4"
                      >
                        Tidak ada data unit.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
