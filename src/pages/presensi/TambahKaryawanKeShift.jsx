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
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPegawai(page));
  }, [dispatch, page]);

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
      })
    ).finally(() => setLoading(false));
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          person_add
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Tambah Karyawan ke Shift
          </div>
          <div className="text-gray-600 text-base font-medium">
            Pilih karyawan yang akan ditambahkan ke shift ID:{" "}
            <span className="font-mono text-emerald-700">{id}</span>
          </div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-4xl flex flex-col gap-8 px-2 md:px-0">
        <div className="flex mb-2">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-bold text-sm mr-auto"
            onClick={() => navigate("/atur_shift")}
          >
            <span
              className="material-icons align-middle mr-1"
              style={{ fontSize: "18px", verticalAlign: "middle" }}
            >
              arrow_back
            </span>
            Back
          </button>
        </div>
        <div className="border border-gray-200 bg-white p-6 shadow flex flex-col gap-4">
          <div className="font-bold text-emerald-600 mb-2 text-xl flex items-center gap-2">
            <span className="material-icons text-emerald-600 text-2xl">
              people
            </span>
            Daftar Karyawan
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white">
              <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                <tr>
                  <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-12">
                    No
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-56">
                    Nama Lengkap
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                    NIP
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                    Jabatan
                  </th>
                  <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-24">
                    Pilih
                  </th>
                </tr>
              </thead>
              <tbody>
                {pegawai.length > 0 ? (
                  pegawai.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={
                        "transition hover:bg-emerald-50 " +
                        (idx % 2 === 0 ? "bg-white" : "bg-gray-50")
                      }
                    >
                      <td className="px-2 py-3 text-center align-middle border-b border-gray-100 font-semibold">
                        {idx + 1 + ((pagination?.current_page - 1) * 20 || 0)}
                      </td>
                      <td className="px-2 py-3 font-bold align-middle border-b border-gray-100 text-emerald-800">
                        {[
                          row.gelar_depan,
                          row.nama_depan,
                          row.nama_tengah,
                          row.nama_belakang,
                          row.gelar_belakang,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </td>
                      <td className="px-2 py-3 align-middle border-b border-gray-100">
                        {row.nipy || row.no_ktp}
                      </td>
                      <td className="px-2 py-3 align-middle border-b border-gray-100">
                        {row.jabatan}
                      </td>
                      <td className="px-2 py-3 text-center align-middle border-b border-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedPegawai.includes(row.id)}
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedPegawai((prev) => [...prev, row.id]);
                            else
                              setSelectedPegawai((prev) =>
                                prev.filter((id) => id !== row.id)
                              );
                          }}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-4">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pagination && pagination.last_page > 1 && (
            <div className="flex flex-wrap gap-1 justify-center mt-4">
              {pagination.links.map((link, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded text-xs font-bold border transition ${
                    link.active
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-emerald-700 border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    if (link.url) {
                      const url = new URL(link.url);
                      const p = url.searchParams.get("page");
                      if (p) setPage(Number(p));
                    }
                  }}
                  disabled={!link.url || link.active}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
          {selectedPegawai.length > 0 && (
            <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded">
              <div className="font-bold text-emerald-700 mb-2 text-sm">
                Pegawai Terpilih:
              </div>
              <ul className="list-disc pl-5 text-sm text-emerald-800">
                {pegawai
                  .filter((row) => selectedPegawai.includes(row.id))
                  .map((row) => (
                    <li key={row.id}>
                      {[
                        row.gelar_depan,
                        row.nama_depan,
                        row.nama_tengah,
                        row.nama_belakang,
                        row.gelar_belakang,
                      ]
                        .filter(Boolean)
                        .join(" ")}{" "}
                      ({row.nipy || row.no_ktp})
                    </li>
                  ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded disabled:opacity-60"
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
