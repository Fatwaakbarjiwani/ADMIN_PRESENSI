import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  fetchPegawai,
  assignPegawaiToShift,
} from "../../redux/actions/shiftAction";

export default function TambahKaryawanKeShift() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); // id shift
  const pegawai = useSelector((state) => state.shift.pegawai);
  const pagination = useSelector((state) => state.shift.pegawaiPagination);
  const [selectedPegawai, setSelectedPegawai] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    dispatch(fetchPegawai(1, ""));
  }, [dispatch]);

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    dispatch(fetchPegawai(1, e.target.value));
  };

  const handleClick = (page) => {
    dispatch(fetchPegawai(page, searchValue));
  }

  const handleSimpan = () => {
    if (selectedPegawai.length === 0) {
      Swal.fire({ icon: "warning", title: "Pilih minimal satu karyawan!" });
      return;
    }
    setLoading(true);
    dispatch(
      assignPegawaiToShift(id, selectedPegawai, () => {
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: "Berhasil menambah karyawan ke shift!",
          timer: 1200,
          showConfirmButton: false,
        });
        navigate(`/atur_shift`);
      }),
    ).finally(() => setLoading(false));
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 transition flex items-center"
        >
          <span className="material-icons text-gray-600">arrow_back</span>
        </button>
        <div className="bg-emerald-600 p-2 flex items-center justify-center">
          <span className="material-icons text-white text-lg">person_add</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Tambah Karyawan ke Shift
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Pilih karyawan untuk shift ID:{" "}
            <span className="font-mono">{id}</span>
          </div>
        </div>
      </div>
      <div className="mx-auto p-6 max-w-full flex flex-col gap-6">
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2">
                  <span className="material-icons text-lg text-emerald-600">
                    people
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wide">
                    Daftar Karyawan
                  </h2>
                  <p className="text-emerald-100 text-xs font-medium">
                    Cari dan centang karyawan yang akan ditambahkan
                  </p>
                </div>
              </div>
              <div className="min-w-[240px]">
                <span className="text-emerald-100 text-xs">search :</span>
                <div className="relative bg-white flex items-center">
                  <input
                    type="text"
                    placeholder="Cari Nama/NIK/Unit"
                    className="px-3 py-2 w-full border-2 border-emerald-300 outline-none text-sm"
                    value={searchValue}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 overflow-y-auto">
            <table className="min-w-full w-full text-sm bg-white">
              <thead className="sticky top-0 z-10 bg-emerald-50 border-b-2 border-emerald-200">
                <tr>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-12">
                    No
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-56">
                    Nama Lengkap
                    <div className="text-[10px] font-normal text-emerald-100 normal-case">
                      (dengan gelar)
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-32">
                    NIK
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-40">
                    Unit Detail
                  </th>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-40">
                    Shift
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-40">
                    Lokasi Presensi
                  </th>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider w-24">
                    Pilih
                  </th>
                </tr>
              </thead>
              <tbody>
                {pegawai.length > 0 ? (
                  pegawai.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-emerald-25"}
                    >
                      <td className="px-3 py-2 text-center align-middle border-b border-emerald-100 font-semibold">
                        {idx + 1 + ((pagination?.current_page - 1) * 20 || 0)}
                      </td>
                      <td className="px-3 py-2 font-bold align-middle border-b border-emerald-100 text-emerald-800">
                        {[row.gelar_depan, row.nama, row.gelar_belakang]
                          .filter(Boolean)
                          .join(" ")}
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-emerald-100">
                        {row.no_ktp}
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-emerald-100">
                        {row.nama_unit}
                      </td>
                      <td className="px-3 py-2 align-middle text-center border-b border-emerald-100">
                        {row.nama_shift ? (
                          <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold border border-emerald-300">
                            {row.nama_shift}
                          </span>
                        ) : (
                          <span className="inline-block bg-gray-100 text-gray-400 px-2 py-0.5 text-xs">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-emerald-100 font-bold text-emerald-700">
                        {row?.nama_lokasi_presensi ? (
                          <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200">
                            <span className="material-icons text-sm text-emerald-500">
                              place
                            </span>
                            <span>{row.nama_lokasi_presensi}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-gray-100 text-gray-400 border border-gray-300">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center align-middle border-b border-emerald-100">
                        <input
                          type="checkbox"
                          checked={selectedPegawai.includes(row.id)}
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedPegawai((prev) => [...prev, row.id]);
                            else
                              setSelectedPegawai((prev) =>
                                prev.filter((id) => id !== row.id),
                              );
                          }}
                          className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500 focus:ring-2"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-400 py-4">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pagination && pagination.last_page > 1 && (
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
                      if (p) handleClick(Number(p));
                    }
                  }}
                  disabled={!link.url || link.active}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
          {selectedPegawai.length > 0 && (
            <div className="m-4 mt-0 p-3 bg-emerald-50 border-2 border-emerald-200">
              <div className="font-bold text-emerald-700 mb-2 text-sm">
                Pegawai Terpilih:
              </div>
              <ul className="list-disc pl-5 text-sm text-emerald-800">
                {pegawai
                  .filter((row) => selectedPegawai.includes(row.id))
                  .map((row) => (
                    <li key={row.id}>
                      {[row.gelar_depan, row.nama, row.gelar_belakang]
                        .filter(Boolean)
                        .join(" ")}{" "}
                      ({row.nipy || row.no_ktp})
                    </li>
                  ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end p-4 pt-0">
            <button
              className="px-6 py-2 bg-emerald-600 text-white font-bold text-sm border-2 border-emerald-700 hover:bg-emerald-700 transition disabled:opacity-60"
              onClick={handleSimpan}
              disabled={loading || selectedPegawai.length === 0}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
