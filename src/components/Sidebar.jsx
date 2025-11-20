import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMe, logout } from "../redux/actions/authAction";

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openSub, setOpenSub] = useState({});
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.role === "super_admin";
  const menu = [
    {
      section: null,
      items: [{ icon: "dashboard", label: "Dashboard", link: "/" }],
    },
    {
      section: "DATA PEGAWAI",
      items: [
        {
          icon: "person",
          label: "Pegawai",
          link: "/management_pegawai",
        },
        // Menu Manajemen Admin hanya untuk superadmin
        ...(isSuperAdmin
          ? [
              {
                icon: "admin_panel_settings",
                label: "Menejemen Admin",
                link: "/menejemen_admin",
              },
            ]
          : []),
      ],
    },
    {
      section: "MENEJEMEN PRESENSI",
      items: [
        { icon: "add_location_alt", label: "Atur Lokasi", link: "/lokasi" },
        { icon: "event", label: "Shift", link: "/atur_shift" },
        {
          icon: "tune",
          label: "Shift Karyawan",
          link: "/shift_dosen_karyawan",
        },
        ...(!isSuperAdmin
          ? [
              {
                icon: "calendar_month",
                label: "Daftar Libur",
                link: "/daftar_libur",
              },
            ]
          : []),
        ...(isSuperAdmin
          ? [
              {
                icon: "settings_input_component",
                label: "Setting Izin",
                link: "/rekap_izin",
              },
            ]
          : []),
        { icon: "work", label: "Dinas", link: "/dinas" },
        // { icon: "upload_file", label: "Import Data CSV", link: "/import_csv" },
      ],
    },
    {
      section: "REPORT",
      // ...(!isSuperAdmin
      //   ? {
      //       section: "REPORT",
      //     }
      //   : {}),
      items: [
        ...(!isSuperAdmin
          ? [
              {
                icon: "insert_chart",
                label: "Rekap Izin",
                link: "/rekap_izin",
              },
            ]
          : []),
        // Rekap Presensi hanya untuk non-superadmin
        ...(!isSuperAdmin
          ? [
              {
                icon: "analytics",
                label: "Rekap Presensi",
                link: "/rekap_presensi",
              },
            ]
          : []),
        ...(isSuperAdmin
          ? [
              {
                icon: "analytics",
                label: "Rekap Presensi",
                link: "/rekap_presensi",
              },
            ]
          : []),
        // { icon: "pie_chart", label: "Sistem Presensi", link: "/report" },
      ],
    },
  ];

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  if (location.pathname === "/login") {
    return null;
  }

  return (
    <aside className="sticky top-0 left-0 h-screen bg-gradient-to-b max-w-[20%] from-green-900 via-green-800 to-green-700 shadow-xl flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center p-4  border-b border-green-800">
        <span className="font-extrabold text-3xl tracking-wide">
          <span className="text-green-300">PRE</span>
          <span className="text-yellow-300">SENSI</span>
        </span>
      </div>
      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {menu.map((group, idx) => (
          <div key={idx} className="mb-2">
            {group.section && (
              <div className="px-4 py-2 text-xs font-bold text-green-300 tracking-widest">
                {group.section}
              </div>
            )}
            {/* User info hanya di atas DATA PEGAWAI */}
            {group.section === "DATA PEGAWAI" && (
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-green-800/70 border border-green-700 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-300 flex items-center justify-center shadow text-green-900 font-bold text-base">
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-base font-bold leading-tight truncate">
                    {user?.role}
                  </div>
                  <div className="text-green-100 text-xs truncate">
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={() => dispatch(logout(navigate))}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 ml-2"
                  title="Logout"
                >
                  <span className="material-icons text-base">logout</span>
                </button>
              </div>
            )}
            {group.items
              .filter((item) => item.label)
              .map((item) => (
                <Link
                  to={item.link}
                  key={item.label}
                  style={{ textDecoration: "none" }}
                >
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    active={
                      item.label === "Pegawai"
                        ? location.pathname === "/management_pegawai" ||
                          location.pathname ===
                            "/tambah-karyawan-ke-unit-detail"
                        : item.label === "Shift"
                        ? location.pathname === "/atur_shift" ||
                          location.pathname.startsWith("/shift-detail/") ||
                          location.pathname.startsWith(
                            "/tambah-karyawan-ke-shift/"
                          )
                        : item.label === "Rekap Presensi"
                        ? location.pathname === "/rekap_presensi" ||
                          location.pathname.startsWith(
                            "/presensi/rekap-bulanan-pegawai/"
                          ) ||
                          location.pathname.startsWith(
                            "/presensi/detail-history-presensi/"
                          )
                        : location.pathname === item.link
                    }
                    hasSub={item.label === "Listing Report List"}
                    openSub={openSub[item.label]}
                    toggleSub={() =>
                      setOpenSub((prev) => ({
                        ...prev,
                        [item.label]: !prev[item.label],
                      }))
                    }
                    onClick={() => {}}
                  />
                </Link>
              ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
  hasSub,
  openSub,
  toggleSub,
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer select-none
          transition-all duration-200
          ${
            active
              ? "bg-green-100/90 text-green-900 font-bold border-l-4 border-yellow-300 shadow"
              : "text-green-100 hover:bg-green-800/70"
          }
        `}
        onClick={hasSub ? toggleSub : onClick}
      >
        <span className="material-icons text-lg opacity-80">{icon}</span>
        <span className="flex-1 text-base">{label}</span>
        {hasSub && (
          <span
            className="material-icons text-sm ml-auto transition-transform duration-200"
            style={{ transform: openSub ? "rotate(90deg)" : "rotate(0deg)" }}
          >
            chevron_right
          </span>
        )}
      </div>
      {/* Dummy submenu */}
      {hasSub && openSub && (
        <div className="ml-10 mt-1 flex flex-col gap-1">
          <div className="text-green-200 text-sm py-1 px-2 rounded hover:bg-green-900/40 cursor-pointer">
            Submenu 1
          </div>
          <div className="text-green-200 text-sm py-1 px-2 rounded hover:bg-green-900/40 cursor-pointer">
            Submenu 2
          </div>
        </div>
      )}
    </div>
  );
}

SidebarItem.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  hasSub: PropTypes.bool,
  openSub: PropTypes.bool,
  toggleSub: PropTypes.func,
};
