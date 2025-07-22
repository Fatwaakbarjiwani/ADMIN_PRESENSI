import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { login } from "../redux/actions/authAction";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError("Email dan password wajib diisi.");
    } else {
      setLocalError("");
      dispatch(
        login(email, password, navigate, (type, message) => {
          if (type === "success") {
            Swal.fire({
              icon: "success",
              title: "Login berhasil!",
              text: message || "Selamat datang!",
              confirmButtonColor: "#16a34a",
              background: "#f0fdf4",
              color: "#14532d",
            });
          } else if (type === "error") {
            Swal.fire({ icon: "error", title: "Login gagal", text: message });
          }
        })
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans">
      {/* Kiri: Welcome Section */}
      <div className="hidden md:flex w-1/2 min-h-screen flex-col justify-between items-start bg-gradient-to-br from-primary via-green-700 to-green-400 p-12 relative">
        {/* Logo/ikon */}
        <div className="flex flex-col gap-8 w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
              <span className="material-icons text-primary text-3xl">
                check_circle
              </span>
            </div>
            <span className="text-green-300 text-2xl font-extrabold tracking-wide">
              PRE<span className="text-yellow-300">SENSI</span>
            </span>
          </div>
          <div className="mt-12">
            <h1 className="text-4xl font-extrabold text-white mb-4">
              Halo Admin! <span className="inline-block">👋</span>
            </h1>
            <p className="text-green-100 text-lg max-w-md mb-8">
              Kelola kehadiran pegawai dan dosen dengan mudah, cepat, dan aman
              melalui sistem presensi online UNISSULA.
            </p>
          </div>
        </div>
        <div className="text-green-200 text-xs mt-8">
          © 2025 Presensi UNISSULA.
        </div>
      </div>
      {/* Kanan: Login Form */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md mx-auto p-8">
          <div className="mb-4">
            <div className="text-2xl font-extrabold text-primary">
              Presensi UNISSULA
            </div>
            <div className="text-gray-500 text-sm mb-2">
              Belum punya akun?{" "}
              <a href="#" className="text-primary font-bold hover:underline">
                Daftar di sini
              </a>
              <br />
            </div>
          </div>
          {(localError || error) && (
            <div className="w-full mb-4 text-yellow-700 bg-yellow-100 border border-yellow-200 rounded px-3 py-2 text-sm text-center">
              {localError || error}
            </div>
          )}
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => handleSubmit(e)}
          >
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="Email Admin"
            />
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Kata Sandi"
            />
            <button
              type="submit"
              className="w-full py-2 rounded bg-primary hover:bg-green-700 text-white font-bold text-base shadow transition-all duration-200 mt-2"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk Sekarang"}
            </button>
          </form>
          <div className="flex justify-between mt-4 text-sm">
            <div></div>
            <a href="#" className="text-primary hover:underline">
              Lupa kata sandi? <span className="font-bold">Klik di sini</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
