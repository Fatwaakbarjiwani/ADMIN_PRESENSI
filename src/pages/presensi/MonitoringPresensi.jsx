import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import HistoryPresensiMonitoring from "./monitoring/HistoryPresensiMonitoring";
import RekapPresensiPegawaiMonitoring from "./monitoring/RekapPresensiPegawaiMonitoring";
import RekapLemburPegawaiMonitoring from "./monitoring/RekapLemburPegawaiMonitoring";
import RekapLaukPaukMonitoring from "./monitoring/RekapLaukPaukMonitoring";
import DetailRekapBulananPegawaiMonitoring from "./monitoring/DetailRekapBulananPegawaiMonitoring";
import DetailHistoryPresensi from "./DetailHistoryPresensi";
import LaporanKehadiranPegawai from "./LaporanKehadiranPegawai";

export default function MonitoringPresensi() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const isDetailPage = location.pathname !== "/monitoring_presensi" && location.pathname !== "/monitoring_presensi/";
  const [tab, setTab] = useState(() => {
    const savedTab = localStorage.getItem("monitoringPresensiTab");
    return ["history", "rekap", "lembur", "laukpauk"].includes(savedTab) ? savedTab : "history";
  });

  useEffect(() => {
    if (tabFromUrl === "history" || tabFromUrl === "rekap" || tabFromUrl === "lembur" || tabFromUrl === "laukpauk") {
      setTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    localStorage.setItem("monitoringPresensiTab", tab);
  }, [tab]);

  if (isDetailPage) {
    return (
      <div className="w-full mx-auto min-h-screen font-sans bg-gray-50">
        <Routes>
          <Route path="rekap-bulanan-pegawai/:pegawai_id" element={<DetailRekapBulananPegawaiMonitoring />} />
          <Route path="detail-history-presensi/:pegawai_id/:unit_id" element={<DetailHistoryPresensi />} />
          <Route path="laporan-kehadiran/:pegawai_id" element={<LaporanKehadiranPegawai />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white text-lg">monitoring</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Monitoring Presensi
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Pantau history presensi dan rekap pegawai unit yang Anda akses
          </div>
        </div>
      </div>
      <div className="mx-auto p-6 flex max-w-full flex-col gap-6">
        <div className="bg-white">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
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
            <button
              className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "lembur"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("lembur")}
            >
              <span className="material-icons text-base">schedule</span>
              Rekap Lembur Pegawai
            </button>
            <button
              className={`px-4 py-2 font-bold text-sm transition border-2 flex items-center gap-2 ${
                tab === "laukpauk"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setTab("laukpauk")}
            >
              <span className="material-icons text-base">restaurant</span>
              Rekap Lauk Pauk
            </button>
          </div>
          {tab === "history" && <HistoryPresensiMonitoring />}
          {tab === "rekap" && <RekapPresensiPegawaiMonitoring />}
          {tab === "lembur" && <RekapLemburPegawaiMonitoring />}
          {tab === "laukpauk" && <RekapLaukPaukMonitoring />}
        </div>
      </div>
    </div>
  );
}
