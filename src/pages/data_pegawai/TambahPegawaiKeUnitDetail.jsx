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
  // fetchUnitDetailByUserId,
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
      // dispatch(fetchUnitDetailByUserId(user.unit_id));
      dispatch(fetchUnitDetails());
    }
  }, [dispatch, user]);

  const unitOptions = useMemo(
    () => unitDetails.map((u) => ({ value: u.id, label: u.nama })),
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
            Tambah Pegawai ke Unit Detail
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Pilih pegawai dan unit detail, lalu klik tambah
          </div>
        </div>
      </div>
      <div className="mx-auto p-6 max-w-7xl flex flex-col gap-6">
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-lg text-emerald-600">
                  group_add
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wide">
                  Pilih Pegawai & Unit Detail
                </h2>
                <p className="text-emerald-100 text-xs font-medium">
                  Centang pegawai dan tentukan unit detail tujuan
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 min-w-[220px]">
                <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                  Unit Detail
                </label>
                <Select
                  className="z-30"
                  options={unitOptions}
                  value={
                    unitOptions.find((opt) => opt.value === unitDetailId) ||
                    null
                  }
                  onChange={(opt) => setUnitDetailId(opt ? opt.value : null)}
                  placeholder="Pilih Unit Detail..."
                  classNamePrefix="select"
                />
              </div>
              <button
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs border-2 border-emerald-700 hover:bg-emerald-700 transition flex items-center gap-2"
                onClick={handleTambah}
              >
                <span className="material-icons text-base">add</span> Tambah ke
                Lokasi Presensi
              </button>
              <div>
                <span className="text-gray-400">
                  <span className="text-xs">search :</span>
                </span>
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
            <div className="w-full border border-emerald-200 shadow-inner overflow-y-hidden">
              <table className="text-sm bg-white table-auto w-[140%]">
                <thead className="sticky top-0 z-10 bg-emerald-50 border-b-2 border-emerald-200">
                  <tr>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      No
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Nama Pegawai
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      NIK
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      No. HP
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Tempat Lahir
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Tanggal Lahir
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      <div className="flex flex-col leading-tight">
                        <span>Unit</span>
                        <span className="text-xs font-normal text-gray-400 normal-case">
                          Detail Unit
                        </span>
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Shift
                    </th>
                    <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200">
                      Lokasi Presensi
                    </th>
                    <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider w-16">
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
                            className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500 focus:ring-2"
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
                        colSpan={10}
                        className="text-center py-6 text-emerald-600 font-bold"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : pegawaiData?.data?.length > 0 ? (
                    pegawaiData.data.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`transition-colors duration-200 ${
                          idx % 2 === 0 ? "bg-white" : "bg-emerald-25"
                        } hover:bg-emerald-50`}
                      >
                        <td className="px-3 py-2 text-center align-middle border-b border-emerald-100 font-semibold whitespace-nowrap">
                          {(pegawaiData.per_page || 20) *
                            ((pegawaiData.current_page || 1) - 1) +
                            idx +
                            1}
                        </td>
                        <td className="px-3 py-2 align-middle border-b border-emerald-100 font-bold text-emerald-800">
                          {row.nama}
                        </td>
                        <td className="px-3 py-2 align-middle border-b border-emerald-100 break-all">
                          {row.no_ktp}
                        </td>
                        <td className="px-3 py-2 align-middle border-b border-emerald-100 break-all">
                          {row.no_hp}
                        </td>
                        <td className="px-3 py-2 align-middle border-b border-emerald-100">
                          {row.tmpt_lahir}
                        </td>
                        <td className="px-3 py-2 align-middle border-b border-emerald-100 whitespace-nowrap">
                          {row.tgl_lahir}
                        </td>
                        <td className="px-3 py-2 align-middle border-b border-emerald-100 font-bold text-emerald-700">
                          {row?.nama_unit ? (
                            <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold border border-emerald-300">
                              {row?.nama_unit}
                            </span>
                          ) : (
                            <span className="inline-block bg-gray-100 text-gray-400 px-2 py-0.5 text-xs">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-middle border-b border-emerald-100 font-bold text-emerald-700">
                          {row?.nama_shift ? (
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
                            onChange={() => handleTogglePegawai(row.id)}
                            className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 focus:ring-emerald-500 focus:ring-2"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center text-gray-400 py-4"
                      >
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
                        className="inline-block bg-emerald-100 text-emerald-800 px-2 py-1 text-xs font-bold border border-emerald-300"
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
                    className={`px-3 py-1 text-xs font-bold border transition ${
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
    </div>
  );
}
