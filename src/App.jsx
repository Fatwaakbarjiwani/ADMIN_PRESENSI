import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AturShift from "./pages/presensi/AturShift";
import DaftarLibur from "./pages/presensi/DaftarLibur";
import ShiftDosenKaryawan from "./pages/presensi/ShiftDosenKaryawan";
import RekapPresensiBulanan from "./pages/presensi/RekapPresensiBulanan";
import DataIzin from "./pages/presensi/DataIzin";
import ImportDataCSV from "./pages/presensi/ImportDataCSV";
import AturLokasi from "./pages/presensi/AturLokasi";
import ShiftDetail from "./pages/presensi/ShiftDetail";
import Protected from "./components/Protected";
import MainLayout from "./components/MainLayout";
import Pegawai from "./pages/data_pegawai/Pegawai";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Protected loginOnly>
              <Login />
            </Protected>
          }
        />
        <Route
          path="/"
          element={
            <Protected>
              <MainLayout>
                <Home />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/lokasi"
          element={
            <Protected>
              <MainLayout>
                <AturLokasi />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/atur_shift"
          element={
            <Protected>
              <MainLayout>
                <AturShift />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/daftar_libur"
          element={
            <Protected>
              <MainLayout>
                <DaftarLibur />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/management_pegawai"
          element={
            <Protected>
              <MainLayout>
                <Pegawai />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/shift_dosen_karyawan"
          element={
            <Protected>
              <MainLayout>
                <ShiftDosenKaryawan />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/rekap_presensi"
          element={
            <Protected>
              <MainLayout>
                <RekapPresensiBulanan />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/rekap_izin"
          element={
            <Protected>
              <MainLayout>
                <DataIzin />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/import_csv"
          element={
            <Protected>
              <MainLayout>
                <ImportDataCSV />
              </MainLayout>
            </Protected>
          }
        />
        <Route
          path="/shift-detail/:id"
          element={
            <Protected>
              <MainLayout>
                <ShiftDetail />
              </MainLayout>
            </Protected>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
