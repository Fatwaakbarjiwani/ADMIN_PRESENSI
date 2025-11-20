import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SettingPresensi from "./SettingPresensi";
import HistoryPresensi from "./rekapBulananPegawai/HistoryPresensi";
import RekapPresensiPegawai from "./rekapBulananPegawai/RekapPresensiPegawai";
import RekapLemburPegawai from "./rekapBulananPegawai/RekapLemburPegawai";
import RekapLaukPauk from "./rekapBulananPegawai/RekapLaukPauk";

export default function RekapPresensiBulanan() {
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.role === "super_admin";
  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem("rekapPresensiTab");
    return savedTab || "history";
  });

  useEffect(() => {
    localStorage.setItem("rekapPresensiTab", tab);
  }, [tab]);

  return (
    <div className="w-full mx-auto min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white text-lg">event</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Rekap Presensi Bulanan
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Pantau history & rekap presensi per unit
          </div>
        </div>
      </div>
      <div className="mx-auto p-6 flex max-w-5xl flex-col gap-6">
        <div className="border border-gray-300 bg-white p-4">
          <div className="grid grid-cols-5 gap-2 mb-6">
            {!isSuperAdmin ? (
              <button
                className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                  tab === "history"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setTab("history")}
              >
                <span className="material-icons text-base">history</span>
                History Presensi
              </button>
            ) : null}
            <button
              className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "rekap"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("rekap")}
            >
              <span className="material-icons text-base">people</span>
              Rekap Presensi Pegawai
            </button>
            {!isSuperAdmin && (
              <button
                className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                  tab === "lembur"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setTab("lembur")}
              >
                <span className="material-icons text-base">watch</span>
                Rekap Lembur Pegawai
              </button>
            )}
            <button
              className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "laukPauk"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("laukPauk")}
            >
              <span className="material-icons text-base">restaurant</span>
              Rekap Lauk Pauk
            </button>
            <button
              className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "controlPresensi"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("controlPresensi")}
            >
              <span className="material-icons text-base">settings</span>
              Kontrol Presensi
            </button>
          </div>
          {tab === "history" && <HistoryPresensi />}
          {tab === "rekap" && <RekapPresensiPegawai />}
          {tab === "lembur" && <RekapLemburPegawai />}
          {tab === "laukPauk" && <RekapLaukPauk />}
          {tab === "controlPresensi" && (
            <div className="bg-white border-2 border-emerald-200 shadow-lg">
              <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2">
                    <span className="material-icons text-lg text-emerald-600">
                      settings
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-wide">
                      Kontrol Presensi
                    </h2>
                    <p className="text-emerald-100 text-xs font-medium">
                      Pengaturan status dan kontrol presensi bulanan
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <SettingPresensi />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
