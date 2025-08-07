import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import {
  addPegawaiToUnitDetail,
  fetchTambahPegawaiList,
} from "../../redux/actions/pegawaiAction";
import {
  fetchUnitDetails,
  fetchUnitDetailByUserId,
} from "../../redux/actions/unitDetailAction";

export default function TambahPegawaiKeUnitDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const pegawaiData = useSelector((state) => state.tambahPegawai.data);
  const loading = useSelector((state) => state.tambahPegawai.loading);
  const unitDetails = useSelector((state) => state.unitDetail.data || []);
  const [selectedPegawai, setSelectedPegawai] = useState([]); // array of id
  const [unitDetailId, setUnitDetailId] = useState(null);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (user !== null) {
      dispatch(fetchTambahPegawaiList(page, searchValue));
    }
  }, [dispatch, user, page, searchValue]);

  useEffect(() => {
    if (user?.role === "super_admin") {
      dispatch(fetchUnitDetails());
    } else if (user?.unit_id) {
      dispatch(fetchUnitDetailByUserId(user.unit_id));
    }
  }, [dispatch, user]);

  const unitOptions = useMemo(
    () => unitDetails.map((u) => ({ value: u.id, label: u.name })),
    [unitDetails]
  );

  const handleTogglePegawai = (id) => {
    setSelectedPegawai((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPegawai.length === pegawaiData?.data?.length) {
      // Jika semua sudah dipilih, hapus semua
      setSelectedPegawai([]);
    } else {
      // Jika belum semua dipilih, pilih semua
      const allIds = pegawaiData?.data?.map((row) => row.id) || [];
      setSelectedPegawai(allIds);
    }
  };

  const isAllSelected =
    pegawaiData?.data?.length > 0 &&
    selectedPegawai.length === pegawaiData.data.length;

  const isIndeterminate =
    selectedPegawai.length > 0 &&
    selectedPegawai.length < (pegawaiData?.data?.length || 0);

  const handleTambah = () => {
    if (!unitDetailId || selectedPegawai?.length === 0) {
      Swal.fire({ icon: "warning", title: "Pilih unit detail dan pegawai!" });
      return;
    }
    dispatch(
      addPegawaiToUnitDetail(unitDetailId, selectedPegawai, () => {
        setSelectedPegawai([]);
        setUnitDetailId(null);
        navigate("/management_pegawai");
      })
    );
  };

  const handleSearch = (e) => {
    const newSearchValue = e.target.value;
    setSearchValue(newSearchValue);
    setPage(1);
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          person_add
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Tambah Pegawai ke Unit Detail
          </div>
          <div className="text-gray-600 text-base font-medium">
            Pilih pegawai dan unit detail, lalu klik tambah
          </div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        <div>
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-bold text-sm"
            onClick={() => navigate("/management_pegawai")}
          >
            <span
              className="material-icons align-middle mr-1"
              style={{ fontSize: "18px", verticalAlign: "middle" }}
            >
              arrow_back
            </span>
            Kembali
          </button>
        </div>
        <div className="border border-gray-200 bg-white p-6 shadow flex flex-col gap-4 mb-4 rounded-xl">
          <div className="flex flex-col md:flex-row gap-4 items-end mb-2">
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs font-semibold text-gray-600 mb-1">
                Unit Detail
              </label>
              <Select
                className="z-30"
                options={unitOptions}
                value={
                  unitOptions.find((opt) => opt.value === unitDetailId) || null
                }
                onChange={(opt) => setUnitDetailId(opt ? opt.value : null)}
                placeholder="Pilih Unit Detail..."
                classNamePrefix="select"
              />
            </div>
            <button
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-sm flex items-center gap-2"
              onClick={handleTambah}
            >
              <span className="material-icons text-base">add</span> Tambah ke
              Unit Detail
            </button>
            <div>
              <span className="text-gray-400">
                <span className="text-xs">search :</span>
              </span>
              <div className="relative bg-white flex items-center">
                <input
                  type="text"
                  placeholder="Cari Nama/NIK/Unit"
                  className="p-2 w-full rounded border border-gray-200 outline-none text-sm"
                  value={searchValue}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white">
              <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                <tr>
                  <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-12">
                    No
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-56">
                    Nama Pegawai
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                    NIK
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                    Email
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-40">
                    Unit Detail
                  </th>
                  <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-16">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs">Pilih</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) {
                              input.indeterminate = isIndeterminate;
                            }
                          }}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <span className="text-xs text-gray-500">Semua</span>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-6 text-emerald-600 font-bold"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : pegawaiData?.data?.length > 0 ? (
                  pegawaiData.data.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-2 py-3 text-center align-middle border-b border-gray-100 font-semibold">
                        {(pegawaiData.per_page || 20) *
                          ((pegawaiData.current_page || 1) - 1) +
                          idx +
                          1}
                      </td>
                      <td className="px-2 py-3 align-middle border-b border-gray-100 font-bold text-emerald-800">
                        {[row.gelar_depan, row.nama, row.gelar_belakang]
                          .filter(Boolean)
                          .join(" ")}
                      </td>
                      <td className="px-2 py-3 align-middle border-b border-gray-100">
                        {row.no_ktp}
                      </td>
                      <td className="px-2 py-3 align-middle border-b border-gray-100">
                        {row.email}
                      </td>
                      <td className="px-2 py-3 align-middle border-b border-gray-100 font-bold text-emerald-700">
                        {row?.unit_detail_name ? (
                          <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-bold">
                            {row?.unit_detail_name}
                          </span>
                        ) : (
                          <span className="inline-block bg-gray-100 text-gray-400 px-2 py-0.5 text-xs">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-center align-middle border-b border-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedPegawai.includes(row.id)}
                          onChange={() => handleTogglePegawai(row.id)}
                          className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-4">
                      Tidak ada data pegawai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* List nama pegawai yang sudah dichecklist */}
          {selectedPegawai.length > 0 && (
            <div className="mt-4">
              <div className="font-semibold text-sm text-emerald-700 mb-1">
                Pegawai terpilih:
              </div>
              <div className="flex flex-wrap gap-2">
                {pegawaiData.data
                  .filter((row) => selectedPegawai.includes(row.id))
                  .map((row) => (
                    <span
                      key={row.id}
                      className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold"
                    >
                      {[row.gelar_depan, row.nama, row.gelar_belakang]
                        .filter(Boolean)
                        .join(" ")}
                    </span>
                  ))}
              </div>
            </div>
          )}
          {/* Pagination */}
          {pegawaiData.links && pegawaiData?.links?.length > 1 && (
            <div className="flex flex-wrap gap-1 justify-center mt-4">
              {pegawaiData.links.map((link, i) => (
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
        </div>
      </div>
    </div>
  );
}
