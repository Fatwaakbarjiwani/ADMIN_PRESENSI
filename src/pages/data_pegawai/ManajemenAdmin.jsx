import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../redux/actions/adminAction";
import {
  fetchAdminMonitoring,
  createAdminMonitoring,
  updateAdminMonitoring,
  deleteAdminMonitoring,
} from "../../redux/actions/adminMonitoringAction";
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

  // Admin Monitoring state
  const [monitoringData, setMonitoringData] = useState([]);
  const [monitoringForm, setMonitoringForm] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    status: "aktif",
    unit_ids: [],
  });
  const [monitoringFormLoading, setMonitoringFormLoading] = useState(false);
  const [monitoringFilterUnit, setMonitoringFilterUnit] = useState("");
  const [showMonitoringPassword, setShowMonitoringPassword] = useState(false);

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
  }, [user, dispatch, formLoading]);

  useEffect(() => {
    if (user && activeTab === "monitoring") {
      dispatch(fetchAdminMonitoring())
        .then((data) => setMonitoringData(Array.isArray(data) ? data : []))
        .catch(() => setMonitoringData([]));
    }
  }, [user, dispatch, activeTab, monitoringFormLoading]);

  // Unit hierarchy untuk Admin Monitoring - SAMA PERSIS seperti Event.jsx
  const unitsFlat = useMemo(() => (Array.isArray(units) ? units : []), [units]);
  const unitsHierarchy = useMemo(() => {
    const getParentId = (u) => {
      const id = u.parent_id ?? u.id_parent ?? u.parent;
      return id === undefined || id === null ? "root" : id;
    };
    const childrenByParent = unitsFlat.reduce((acc, u) => {
      const pid = getParentId(u);
      if (!acc[pid]) acc[pid] = [];
      acc[pid].push(u);
      return acc;
    }, {});
    const buildOrdered = (parentKey, depth) => {
      const list = [];
      (childrenByParent[parentKey] || []).forEach((unit) => {
        list.push({ ...unit, depth });
        list.push(...buildOrdered(unit.id, depth + 1));
      });
      return list;
    };
    return buildOrdered("root", 0);
  }, [unitsFlat]);
  const indentLabel = (depth, nama) => {
    const d = depth || 0;
    const space = "\u00A0".repeat(d * 3);
    const prefix = d > 0 ? "›\u00A0" : "";
    return `${space}${prefix}${nama}`;
  };
  const getUnitIcon = (depth) => {
    const d = depth || 0;
    if (d === 0) return "account_balance"; // Root
    if (d === 1) return "business"; // Level 1
    if (d === 2) return "folder"; // Level 2
    if (d >= 3) return "folder_open"; // Level 3+
    return "business";
  };

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

  const handleMonitoringSubmit = (e) => {
    e.preventDefault();
    setMonitoringFormLoading(true);
    const body = {
      name: monitoringForm.name,
      email: monitoringForm.email,
      status: monitoringForm.status,
      unit_ids: monitoringForm.unit_ids,
    };
    if (monitoringForm.password) {
      body.password = monitoringForm.password;
    }
    if (monitoringForm.id) {
      dispatch(
        updateAdminMonitoring(
          monitoringForm.id,
          body,
          () => {
            setMonitoringForm({
              id: null,
              name: "",
              email: "",
              password: "",
              status: "aktif",
              unit_ids: [],
            });
            setMonitoringFormLoading(false);
            dispatch(fetchAdminMonitoring()).then((data) =>
              setMonitoringData(Array.isArray(data) ? data : [])
            );
            Swal.fire({
              icon: "success",
              title: "Berhasil update admin monitoring",
              timer: 1200,
              showConfirmButton: false,
            });
          },
          (err) => {
            let msg = "Gagal menyimpan data admin monitoring";
            if (
              err.response &&
              (err.response.data?.message || err.response.data?.errors)
            ) {
              if (err.response.data.errors) {
                msg = Object.values(err.response.data.errors).flat().join("\n");
              } else {
                msg = err.response.data.message;
              }
              Swal.fire({ icon: "error", title: "Validasi Gagal", text: msg });
            }
            setMonitoringFormLoading(false);
          }
        )
      );
    } else {
      dispatch(
        createAdminMonitoring(
          body,
          () => {
            setMonitoringForm({
              id: null,
              name: "",
              email: "",
              password: "",
              status: "aktif",
              unit_ids: [],
            });
            setMonitoringFormLoading(false);
            dispatch(fetchAdminMonitoring()).then((data) =>
              setMonitoringData(Array.isArray(data) ? data : [])
            );
            Swal.fire({
              icon: "success",
              title: "Berhasil tambah admin monitoring",
              timer: 1200,
              showConfirmButton: false,
            });
          },
          (err) => {
            let msg = "Gagal menyimpan data admin monitoring";
            if (
              err.response &&
              (err.response.data?.message || err.response.data?.errors)
            ) {
              if (err.response.data.errors) {
                msg = Object.values(err.response.data.errors).flat().join("\n");
              } else {
                msg = err.response.data.message;
              }
              Swal.fire({ icon: "error", title: "Validasi Gagal", text: msg });
            }
            setMonitoringFormLoading(false);
          }
        )
      );
    }
  };

  const handleMonitoringEdit = (row) => {
    setMonitoringForm({
      id: row.id,
      name: row.name,
      email: row.email,
      password: "",
      status: row.status,
      unit_ids: (row.units || []).map((u) => u.id),
    });
  };

  const handleMonitoringDelete = (id) => {
    if (!id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "ID admin tidak valid",
      });
      return;
    }
    Swal.fire({
      title: "Yakin hapus admin monitoring ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setMonitoringFormLoading(true);
        dispatch(
          deleteAdminMonitoring(
            id,
            () => {
              setMonitoringFormLoading(false);
              dispatch(fetchAdminMonitoring()).then((data) =>
                setMonitoringData(Array.isArray(data) ? data : [])
              );
              Swal.fire({
                icon: "success",
                title: "Admin monitoring berhasil dihapus",
                timer: 1200,
                showConfirmButton: false,
              });
            },
            () => {
              setMonitoringFormLoading(false);
              Swal.fire({
                icon: "error",
                title: "Gagal menghapus admin monitoring",
              });
            }
          )
        );
      }
    });
  };

  const toggleMonitoringUnit = (unitId) => {
    setMonitoringForm((f) => {
      const ids = f.unit_ids || [];
      const exists = ids.includes(unitId);
      return {
        ...f,
        unit_ids: exists
          ? ids.filter((id) => id !== unitId)
          : [...ids, unitId],
      };
    });
  };

  const handleSelectAllMonitoringUnits = () => {
    const allIds = unitsHierarchy.map((u) => u.id);
    const currentIds = monitoringForm.unit_ids || [];
    if (currentIds.length === allIds.length) {
      setMonitoringForm((f) => ({ ...f, unit_ids: [] }));
    } else {
      setMonitoringForm((f) => ({ ...f, unit_ids: allIds }));
    }
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
            Kelola data admin unit, admin monitoring, dan unit
          </div>
        </div>
      </div>

      <div className="mx-auto p-6 max-w-7xl flex flex-col gap-6">
        {/* Tab Navigation */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          <div className="flex">
            <button
              className={`flex-1 px-4 py-2 font-semibold text-sm transition-all duration-200 border-r-2 border-emerald-200 flex items-center gap-2 ${
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
              className={`flex-1 px-4 py-2 font-semibold text-sm transition-all duration-200 border-r-2 border-emerald-200 flex items-center gap-2 ${
                activeTab === "monitoring"
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-emerald-700 hover:bg-emerald-50"
              }`}
              onClick={() => setActiveTab("monitoring")}
            >
              <span className="material-icons text-lg">monitoring</span>
              Admin Monitoring
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
                      className="w-full border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                      value={form.unit_id}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, unit_id: e.target.value }))
                      }
                      disabled={formLoading}
                      required
                    >
                      <option value="">Pilih Unit</option>
                      {unitsHierarchy.map((unit) => {
                        const depth = unit.depth ?? 0;
                        const nama = unit?.nama ?? unit?.name ?? unit.id ?? "-";
                        return (
                          <option key={unit.id} value={unit.id}>
                            {indentLabel(depth, nama)}
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
                    className="border-2 border-emerald-300 px-3 py-1 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                    value={filterUnit}
                    onChange={(e) => setFilterUnit(e.target.value)}
                  >
                    <option value="">Semua Unit</option>
                    {unitsHierarchy.map((unit) => {
                      const depth = unit.depth ?? 0;
                      const nama = unit?.nama ?? unit?.name ?? unit.id ?? "-";
                      return (
                        <option key={unit.id} value={unit.id}>
                          {indentLabel(depth, nama)}
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

        {/* Admin Monitoring Tab */}
        {activeTab === "monitoring" && (
          <div className="bg-white border-2 border-emerald-200 shadow-lg">
            <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2">
                  <span className="material-icons text-lg text-emerald-600">
                    monitoring
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wide">
                    Data Admin Monitoring
                  </h2>
                  <p className="text-emerald-100 text-xs font-medium">
                    Kelola data admin monitoring
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b-2 border-emerald-200">
              <form onSubmit={handleMonitoringSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                      Nama Admin
                    </label>
                    <input
                      className="w-full border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="Masukkan nama admin"
                      value={monitoringForm.name}
                      onChange={(e) =>
                        setMonitoringForm((f) => ({
                          ...f,
                          name: e.target.value,
                        }))
                      }
                      disabled={monitoringFormLoading}
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
                      type="email"
                      value={monitoringForm.email}
                      onChange={(e) =>
                        setMonitoringForm((f) => ({
                          ...f,
                          email: e.target.value,
                        }))
                      }
                      disabled={monitoringFormLoading}
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                      Password
                    </label>
                    <input
                      className="w-full border-2 border-emerald-300 px-3 py-2 pr-10 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder={
                        monitoringForm.id
                          ? "Kosongkan jika tidak diubah"
                          : "Masukkan password"
                      }
                      type={showMonitoringPassword ? "text" : "password"}
                      value={monitoringForm.password}
                      onChange={(e) =>
                        setMonitoringForm((f) => ({
                          ...f,
                          password: e.target.value,
                        }))
                      }
                      disabled={monitoringFormLoading}
                      required={!monitoringForm.id}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-8 text-emerald-400 hover:text-emerald-600"
                      onClick={() =>
                        setShowMonitoringPassword((v) => !v)
                      }
                      title={
                        showMonitoringPassword
                          ? "Sembunyikan Password"
                          : "Tampilkan Password"
                      }
                    >
                      <span className="material-icons text-sm">
                        {showMonitoringPassword
                          ? "visibility_off"
                          : "visibility"}
                      </span>
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                      Status
                    </label>
                    <select
                      className="w-full border-2 border-emerald-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors"
                      value={monitoringForm.status}
                      onChange={(e) =>
                        setMonitoringForm((f) => ({
                          ...f,
                          status: e.target.value,
                        }))
                      }
                      disabled={monitoringFormLoading}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="bg-white border-2 border-emerald-200 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-5 py-3.5 border-b-2 border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                            <span className="material-icons text-emerald-600 text-lg">
                              account_tree
                            </span>
                            Pilih Unit
                          </h3>
                          <p className="text-emerald-600 text-xs mt-1">
                            Urutan sesuai hierarki: Level 0 (root) → Level 1
                            (child) → Level 2 (sub-child). Pilih unit yang dapat
                            diakses admin monitoring.
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                            {(monitoringForm.unit_ids || []).length} unit
                            dipilih
                          </span>
                          <button
                            type="button"
                            onClick={handleSelectAllMonitoringUnits}
                            disabled={
                              monitoringFormLoading ||
                              unitsHierarchy.length === 0
                            }
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold px-2 py-1 hover:bg-emerald-100 rounded transition disabled:opacity-50"
                          >
                            {(monitoringForm.unit_ids || []).length ===
                            unitsHierarchy.length
                              ? "Batal Pilih Semua"
                              : "Pilih Semua"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                        {unitsHierarchy.map((unit) => {
                          const nama =
                            unit?.nama ?? unit?.name ?? unit.id ?? "-";
                          const depth = unit.depth ?? 0;
                          const isSelected = (
                            monitoringForm.unit_ids || []
                          ).includes(unit.id);
                          const indentPx = depth * 20 + 12;
                          return (
                            <label
                              key={unit.id}
                              className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-all border-l-4 ${
                                isSelected
                                  ? "bg-emerald-100 border-emerald-500 text-emerald-900"
                                  : "bg-white border-emerald-200 hover:bg-emerald-50 text-emerald-800"
                              }`}
                              style={{ paddingLeft: `${indentPx}px` }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  toggleMonitoringUnit(unit.id)
                                }
                                disabled={monitoringFormLoading}
                                className="w-4 h-4 text-emerald-600 border-emerald-300 focus:ring-emerald-500 rounded flex-shrink-0"
                              />
                              <span
                                className="material-icons text-emerald-600 text-base flex-shrink-0"
                                title={
                                  depth === 0
                                    ? "Level 0 (Root)"
                                    : `Level ${depth} (Child)`
                                }
                              >
                                {getUnitIcon(depth)}
                              </span>
                              <span className="text-sm font-medium flex-1 min-w-0">
                                {nama}
                              </span>
                              {depth > 0 && (
                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded flex-shrink-0">
                                  L{depth}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                      {unitsHierarchy.length === 0 && (
                        <div className="py-6 text-center">
                          <span className="material-icons text-4xl text-gray-300 mb-2 block">
                            account_tree
                          </span>
                          <span className="text-gray-400 text-sm">
                            Tidak ada unit tersedia
                          </span>
                        </div>
                      )}
                      {(monitoringForm.unit_ids || []).length === 0 &&
                        unitsHierarchy.length > 0 && (
                          <p className="text-amber-600 text-xs mt-3 flex items-center gap-1">
                            <span className="material-icons text-sm">
                              info
                            </span>
                            Pilih minimal satu unit
                          </p>
                        )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    disabled={
                      monitoringFormLoading ||
                      (monitoringForm.unit_ids || []).length === 0
                    }
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all duration-200 flex items-center gap-1 border-2 border-emerald-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {monitoringFormLoading ? (
                      <>
                        <span className="material-icons text-sm animate-spin">
                          hourglass_empty
                        </span>
                        Loading...
                      </>
                    ) : monitoringForm.id ? (
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
                  {monitoringForm.id && (
                    <button
                      type="button"
                      onClick={() =>
                        setMonitoringForm({
                          id: null,
                          name: "",
                          email: "",
                          password: "",
                          status: "aktif",
                          unit_ids: [],
                        })
                      }
                      className="px-4 py-2 bg-gray-500 text-white font-bold text-xs hover:bg-gray-600 transition-all duration-200 flex items-center gap-1 border-2 border-gray-600 shadow-lg hover:shadow-xl"
                    >
                      <span className="material-icons text-sm">cancel</span>
                      Batal
                    </button>
                  )}
                </div>
              </form>
              {monitoringForm.id && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-1 text-yellow-700 font-bold text-xs">
                    <span className="material-icons text-sm">edit</span>
                    Edit Admin: {monitoringForm.name} ({monitoringForm.email})
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-b-2 border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Filter Unit:
                </label>
                <select
                  className="border-2 border-emerald-300 px-3 py-1 text-sm font-medium focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                  value={monitoringFilterUnit}
                  onChange={(e) => setMonitoringFilterUnit(e.target.value)}
                >
                  <option value="">Semua Unit</option>
                  {unitsHierarchy.map((unit) => {
                    const nama = unit?.nama ?? unit?.name ?? unit.id ?? "-";
                    return (
                      <option key={unit.id} value={unit.id}>
                        {indentLabel(unit.depth ?? 0, nama)}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

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
                  {(monitoringFilterUnit
                    ? monitoringData.filter((row) =>
                        (row.units || []).some(
                          (u) => String(u.id) === String(monitoringFilterUnit)
                        )
                      )
                    : monitoringData
                  ).length > 0 ? (
                    (monitoringFilterUnit
                      ? monitoringData.filter((row) =>
                          (row.units || []).some(
                            (u) =>
                              String(u.id) === String(monitoringFilterUnit)
                          )
                        )
                      : monitoringData
                    ).map((row, idx) => (
                      <tr
                        key={`monitoring-${row?.id || idx}`}
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
                        <td className="px-3 py-2 border-r border-emerald-100">
                          <div className="flex flex-wrap gap-1">
                            {(row.units || []).map((u) => (
                              <span
                                key={u.id}
                                className="inline-flex items-center px-2 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                              >
                                {u.nama}
                              </span>
                            ))}
                            {(row.units || []).length === 0 && (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
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
                              onClick={() => handleMonitoringEdit(row)}
                              className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-all duration-200 border border-emerald-200 hover:border-emerald-300"
                              title="Edit Admin"
                            >
                              <span className="material-icons text-sm">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                handleMonitoringDelete(row.id)
                              }
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
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <span className="material-icons text-6xl text-gray-300">
                            monitoring
                          </span>
                          <div className="text-gray-500 font-bold text-lg">
                            Tidak ada data admin monitoring
                          </div>
                          <div className="text-gray-400 text-sm">
                            Belum ada data admin monitoring yang tersedia
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
