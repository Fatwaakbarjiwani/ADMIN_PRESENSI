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
// import {
//   createUnit,
//   updateUnit,
//   deleteUnit,
// } from "../../redux/actions/unitAction";

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
  // const [unitForm, setUnitForm] = useState({
  //   id: null,
  //   name: "",
  // });
  // const [unitFormLoading, setUnitFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("admin"); // "admin" or "unit"

  useEffect(() => {
    if (user || formLoading == false) {
      dispatch(fetchAdmin());
      dispatch(fetchAllUnit());
    }
    // if (user || formLoading == false || unitFormLoading == false) {
    //   dispatch(fetchAdmin());
    //   dispatch(fetchAllUnit());
    // }
  }, [user, dispatch, formLoading]);

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
  // const handleUnitSubmit = (e) => {
  //   e.preventDefault();
  //   setUnitFormLoading(true);
  //   const body = { name: unitForm.name };
  //   if (unitForm.id) {
  //     // Update unit
  //     dispatch(updateUnit(unitForm.id, body)).finally(() => {
  //       setUnitFormLoading(false);
  //     });
  //   } else {
  //     // Tambah unit baru
  //     dispatch(
  //       createUnit(
  //         body,
  //         () => {
  //           setUnitForm({ id: null, name: "" });
  //           setUnitFormLoading(false);
  //           Swal.fire({
  //             icon: "success",
  //             title: "Berhasil tambah unit",
  //             timer: 1200,
  //             showConfirmButton: false,
  //           });
  //         },
  //         (err) => {
  //           let msg = "Gagal menyimpan data unit";
  //           if (
  //             err.response &&
  //             (err.response.data?.message || err.response.data?.errors)
  //           ) {
  //             if (err.response.data.errors) {
  //               msg = Object.values(err.response.data.errors).flat().join("\n");
  //             } else {
  //               msg = err.response.data.message;
  //             }
  //           }
  //           Swal.fire({ icon: "error", title: "Validasi Gagal", text: msg });
  //           setUnitFormLoading(false);
  //         }
  //       )
  //     );
  //   }
  // };

  // const handleUnitEdit = (row) => {
  //   setUnitForm({
  //     id: row.id,
  //     name: row.name,
  //   });
  // };

  // const handleUnitDelete = (id) => {
  //   if (!id) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error",
  //       text: "ID unit tidak valid",
  //     });
  //     return;
  //   }

  //   Swal.fire({
  //     title: "Yakin hapus unit ini?",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "Ya, Hapus",
  //     cancelButtonText: "Batal",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       setUnitFormLoading(true);
  //       dispatch(deleteUnit(id)).finally(() => {
  //         setUnitFormLoading(false);
  //       });
  //     }
  //   });
  // };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white text-lg">
            admin_panel_settings
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Manajemen Admin & Unit
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Kelola data admin unit dan unit
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-7xl flex flex-col gap-6">
        {/* Tab Navigation */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          <div className="flex">
            <button
              className={`flex-1 px-4 py-2 font-semibold text-sm transition-all duration-200 border-r-2 border-emerald-200 last:border-r-0 flex items-center gap-2 ${
                activeTab === "admin"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-700 hover:bg-emerald-50"
              }`}
              onClick={() => setActiveTab("admin")}
            >
              <span className="material-icons text-lg">
                admin_panel_settings
              </span>
              Admin Unit
            </button>
            <button
              className={`flex-1 px-4 py-2 font-semibold text-sm transition-all duration-200 border-r-2 border-emerald-200 last:border-r-0 flex items-center gap-2 ${
                activeTab === "unit"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-700 hover:bg-emerald-50"
              }`}
              onClick={() => setActiveTab("unit")}
            >
              <span className="material-icons text-lg">business</span>
              Unit
            </button>
          </div>
        </div>

        {/* Admin Tab */}
        {activeTab === "admin" && (
          <div className="bg-white border-2 border-emerald-200 shadow-lg">
            {/* Card Header */}
            <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2">
                  <span className="material-icons text-lg text-emerald-600">
                    admin_panel_settings
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wide">
                    Data Admin Unit
                  </h2>
                  <p className="text-emerald-100 text-xs font-medium">
                    Kelola data admin unit
                  </p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-4 border-b-2 border-emerald-200">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                      Nama Admin
                    </label>
                    <input
                      className="w-full border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="Masukkan nama admin"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      disabled={formLoading}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                      Email
                    </label>
                    <input
                      className="w-full border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="Masukkan email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      disabled={formLoading}
                      required
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                      Password
                    </label>
                    <input
                      className="w-full border-2 border-emerald-300 px-3 py-2 pr-10 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="Masukkan password"
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
                      className="absolute right-2 top-8 text-emerald-400 hover:text-emerald-600"
                      onClick={() => setShowPassword((v) => !v)}
                      title={
                        showPassword
                          ? "Sembunyikan Password"
                          : "Tampilkan Password"
                      }
                    >
                      <span className="material-icons text-sm">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                      Unit
                    </label>
                    <select
                      className="w-full border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                      value={form.unit_id}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, unit_id: e.target.value }))
                      }
                      disabled={formLoading}
                      required
                    >
                      <option value="">Pilih Unit</option>
                      {units.map((unit) => {
                        const level = parseInt(unit?.level) || 0;
                        const indent = "\u00A0".repeat(level * 4);

                        let icon = "";
                        if (level === 0) {
                          icon = "🏢";
                        } else if (level === 1) {
                          icon = "📁";
                        } else if (level === 2) {
                          icon = "📂";
                        } else if (level === 3) {
                          icon = "📄";
                        } else if (level === 4) {
                          icon = "📋";
                        } else {
                          icon = "🧾";
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                        Status
                      </label>
                      <select
                        className="border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                        value={form.status}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, status: e.target.value }))
                        }
                        disabled={formLoading}
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all duration-200 flex items-center gap-1 border-2 border-emerald-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formLoading ? (
                        <>
                          <span className="material-icons text-sm animate-spin">
                            hourglass_empty
                          </span>
                          Loading...
                        </>
                      ) : form.id ? (
                        <>
                          <span className="material-icons text-sm">edit</span>
                          Update Admin
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-sm">add</span>
                          Tambah Admin
                        </>
                      )}
                    </button>
                    {form.id && (
                      <button
                        type="button"
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
                        className="px-4 py-2 bg-gray-500 text-white font-bold text-xs hover:bg-gray-600 transition-all duration-200 flex items-center gap-1 border-2 border-gray-600 shadow-lg hover:shadow-xl"
                      >
                        <span className="material-icons text-sm">cancel</span>
                        Batal
                      </button>
                    )}
                  </div>
                </div>
              </form>
              {form.id && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-1 text-yellow-700 font-bold text-xs">
                    <span className="material-icons text-sm">edit</span>
                    Edit Admin: {form.name} ({form.email})
                  </div>
                </div>
              )}
            </div>

            {/* Filter Section */}
            <div className="p-4 border-b-2 border-emerald-200 bg-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-emerald-200">
                    <span className="material-icons text-emerald-600 text-lg">
                      verified_user
                    </span>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                      Super Admin
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-emerald-200">
                    <span className="material-icons text-emerald-600 text-lg">
                      person
                    </span>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                      Admin Unit
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    Filter Unit:
                  </label>
                  <select
                    className="border-2 border-emerald-300 px-3 py-1 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                    value={filterUnit}
                    onChange={(e) => setFilterUnit(e.target.value)}
                  >
                    <option value="">Semua Unit</option>
                    {units.map((unit) => {
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
                        icon = "🧾"; // Receipt untuk level 5+
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
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                  <tr>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      No
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Nama
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Email
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Role
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Unit
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider">
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
                        className={`transition-all duration-200 hover:bg-emerald-50 border-b border-emerald-100 ${
                          idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                        }`}
                      >
                        <td className="px-3 py-2 text-center font-bold text-emerald-700 border-r border-emerald-100 text-sm">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-bold text-emerald-800 border-r border-emerald-100 text-sm">
                          {row.name}
                        </td>
                        <td className="px-3 py-2 text-gray-700 border-r border-emerald-100 text-sm">
                          {row.email}
                        </td>
                        <td className="px-3 py-2 text-center border-r border-emerald-100">
                          {row.role === "super_admin" ? (
                            <span
                              className="material-icons text-emerald-600 text-lg"
                              title="Super Admin"
                            >
                              verified_user
                            </span>
                          ) : (
                            <span
                              className="material-icons text-emerald-600 text-lg"
                              title="Admin Unit"
                            >
                              person
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 border-r border-emerald-100">
                          {row.unit?.nama ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {row.unit.nama}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-400 border border-gray-300">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center border-r border-emerald-100">
                          {row.status === "aktif" ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleEdit(row)}
                              className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-all duration-200 border border-emerald-200 hover:border-emerald-300"
                              title="Edit Admin"
                            >
                              <span className="material-icons text-sm">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200 border border-red-200 hover:border-red-300"
                              title="Hapus Admin"
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
                      <td colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-icons text-6xl text-gray-300">
                            admin_panel_settings
                          </span>
                          <div className="text-gray-500 font-bold text-lg">
                            Tidak ada data admin
                          </div>
                          <div className="text-gray-400 text-sm">
                            Belum ada data admin yang tersedia
                          </div>
                        </div>
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
          <div className="bg-white border-2 border-emerald-200 shadow-lg">
            {/* Card Header */}
            <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2">
                  <span className="material-icons text-lg text-emerald-600">
                    business
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wide">
                    Data Unit
                  </h2>
                  <p className="text-emerald-100 text-xs font-medium">
                    Kelola data unit organisasi
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* <form
              className="flex flex-wrap gap-4 mb-6 items-end"
              onSubmit={handleUnitSubmit}
            >
              <div className="flex flex-col flex-1 min-w-[200px]">
                <label className="text-sm font-semibold text-gray-600 mb-2">
                  Nama Unit
                </label>
                <input
                  className="border border-gray-300 px-3 py-2 text-sm rounded"
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
                  className={`px-4 py-2 font-bold text-sm transition-colors rounded ${
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
                    className="px-4 py-2 font-bold text-sm bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition-colors"
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
              <div className="mb-4 text-sm text-yellow-700 font-semibold bg-yellow-50 px-3 py-2 rounded">
                Edit Unit: {unitForm?.name || ""}
              </div>
            )} */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                    <tr>
                      <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        No
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                        Nama Unit
                      </th>
                      <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider">
                        Detail Unit
                      </th>
                      {/* <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider w-24">
                      Aksi
                    </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {units ? (
                      units.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`transition-all duration-200 hover:bg-emerald-50 border-b border-emerald-100 ${
                            idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                          }`}
                        >
                          <td className="px-3 py-2 text-center font-bold text-emerald-700 border-r border-emerald-100 text-sm">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2 font-bold text-emerald-800 border-r border-emerald-100 text-sm">
                            {row?.nama}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {row?.children?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {row?.children?.map((detail) => (
                                  <span
                                    key={detail?.id || Math.random()}
                                    className="inline-flex items-center px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  >
                                    {detail?.nama || "Unknown"}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-400 border border-gray-300">
                                Tidak ada detail
                              </span>
                            )}
                          </td>
                          {/* <td className="px-4 py-4 text-center align-middle border-b border-gray-100">
                          <div className="flex gap-1 justify-center">
                            <button
                              className="w-8 h-8 flex items-center justify-center text-yellow-600 hover:text-yellow-800 rounded transition-colors"
                              onClick={() => handleUnitEdit(row)}
                              disabled={unitFormLoading}
                              title="Edit"
                            >
                              <span className="material-icons text-base">
                                edit
                              </span>
                            </button>
                            <button
                              className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 rounded transition-colors"
                              onClick={() => handleUnitDelete(row?.id)}
                              disabled={unitFormLoading}
                              title="Hapus"
                            >
                              <span className="material-icons text-base">
                                delete
                              </span>
                            </button>
                          </div>
                        </td> */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-12">
                          <div className="flex flex-col items-center gap-4">
                            <span className="material-icons text-6xl text-gray-300">
                              business
                            </span>
                            <div className="text-gray-500 font-bold text-lg">
                              Tidak ada data unit
                            </div>
                            <div className="text-gray-400 text-sm">
                              Belum ada data unit yang tersedia
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
