import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import Select from "react-select";
import DatePicker from "react-multi-date-picker";
import {
  fetchHariLibur,
  createHariLibur,
  updateHariLibur,
  deleteHariLibur,
} from "../../redux/actions/hariLiburAction";
import { fetchUnitDetails } from "../../redux/actions/unitDetailAction";

function formatTanggal(tgl) {
  if (!tgl) return "-";
  const d = new Date(tgl);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DaftarLibur() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const hariLiburRaw = useSelector((state) => state.hariLibur.data);
  const loading = useSelector((state) => state.hariLibur.loading);
  const unitDetailsRaw = useSelector((state) => state.unitDetail.data);
  const hariLibur = useMemo(() => hariLiburRaw || [], [hariLiburRaw]);
  const unitDetails = useMemo(() => unitDetailsRaw || [], [unitDetailsRaw]);

  const [bulan, setBulan] = useState(() =>
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [tahun, setTahun] = useState(() => String(new Date().getFullYear()));
  // Multi-date picker state
  const [selectedDates, setSelectedDates] = useState([]); // array of string (yyyy-mm-dd)
  const [inputRows, setInputRows] = useState([]); // [{tanggal, keterangan, unit_detail_ids: []}]
  // Edit state
  const [editRow, setEditRow] = useState(null); // {tanggal, keterangan, unit_detail_ids, id, unit_detail_id}
  const [selectedRows, setSelectedRows] = useState([]); // untuk bulk delete

  useEffect(() => {
    if (user?.unit_id) {
      dispatch(fetchUnitDetails());
    }
  }, [dispatch, user]);

  useEffect(() => {
    dispatch(fetchHariLibur(bulan, tahun));
  }, [dispatch, bulan, tahun]);

  // Update inputRows when selectedDates changes
  useEffect(() => {
    setInputRows((prev) => {
      const newRows = selectedDates
        .filter((tgl) => !prev.some((row) => row.tanggal === tgl))
        .map((tgl) => ({ tanggal: tgl, keterangan: "", unit_detail_ids: [] }));
      const filtered = prev.filter((row) =>
        selectedDates.includes(row.tanggal)
      );
      return [...filtered, ...newRows];
    });
  }, [selectedDates]);

  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const unitOptions = [
    { value: "ALL", label: "Pilih Semua Unit Detail" },
    ...unitDetails.map((u) => ({ value: u.id, label: u.nama })),
  ];

  // Handler tambah per tanggal
  const handleTambahBaris = (row, idx) => {
    if (!row.keterangan || row.unit_detail_ids.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi keterangan & unit detail!",
      });
      return;
    }
    dispatch(
      createHariLibur(
        {
          unit_detail_ids: row.unit_detail_ids,
          tanggal: row.tanggal,
          keterangan: row.keterangan,
        },
        () => {
          setInputRows((rows) => rows.filter((_, i) => i !== idx));
          setSelectedDates((dates) =>
            dates.filter((tgl) => tgl !== row.tanggal)
          );
          dispatch(fetchHariLibur(bulan, tahun));
        }
      )
    );
  };

  // Handler untuk multi-select per baris
  const handleSelectUnit = (selected, idx) => {
    if (!selected) {
      setInputRows((rows) =>
        rows.map((row, i) =>
          i === idx ? { ...row, unit_detail_ids: [] } : row
        )
      );
      return;
    }
    if (selected.some((opt) => opt.value === "ALL")) {
      setInputRows((rows) =>
        rows.map((row, i) =>
          i === idx
            ? { ...row, unit_detail_ids: unitDetails.map((u) => u.id) }
            : row
        )
      );
    } else {
      setInputRows((rows) =>
        rows.map((row, i) =>
          i === idx
            ? { ...row, unit_detail_ids: selected.map((opt) => opt.value) }
            : row
        )
      );
    }
  };

  // Handler untuk keterangan per baris
  const handleKeterangan = (val, idx) => {
    setInputRows((rows) =>
      rows.map((row, i) => (i === idx ? { ...row, keterangan: val } : row))
    );
  };

  // Handler edit baris dari tabel
  const handleEdit = (row) => {
    setEditRow({
      id: row.id,
      tanggal: row.tanggal,
      keterangan: row.keterangan,
      unit_detail_ids: [row.unit_detail_id].filter(Boolean),
      unit_detail_id: row.unit_detail_id,
    });
  };

  // Handler update hari libur
  const handleUpdateEdit = () => {
    if (!editRow.keterangan || editRow.unit_detail_ids.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi keterangan & unit detail!",
      });
      return;
    }
    dispatch(
      updateHariLibur(
        {
          unit_detail_ids: editRow.unit_detail_ids,
          tanggal: editRow.tanggal,
          keterangan: editRow.keterangan,
        },
        () => {
          setEditRow(null);
          dispatch(fetchHariLibur(bulan, tahun));
        }
      )
    );
  };

  // Handler untuk multi-select di edit
  const handleEditSelectUnit = (selected) => {
    if (!selected) {
      setEditRow((row) => ({ ...row, unit_detail_ids: [] }));
      return;
    }
    if (selected.some((opt) => opt.value === "ALL")) {
      setEditRow((row) => ({
        ...row,
        unit_detail_ids: unitDetails.map((u) => u.id),
      }));
    } else {
      setEditRow((row) => ({
        ...row,
        unit_detail_ids: selected.map((opt) => opt.value),
      }));
    }
  };

  // Handler hapus hari libur
  const handleDelete = (row) => {
    Swal.fire({
      title: "Yakin hapus hari libur ini?",
      html: `
        <div style='text-align:left'>
          <b>Tanggal:</b> ${formatTanggal(row.tanggal)}<br/>
          <b>Keterangan:</b> ${row.keterangan}<br/>
          <b>Unit:</b> ${row.unit_name}<br/>
          <b>Unit Detail:</b> ${row.unit_detail_name}
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(
          deleteHariLibur(
            {
              unit_detail_ids: [row.unit_detail_id],
              tanggal: row.tanggal,
            },
            () => {
              dispatch(fetchHariLibur(bulan, tahun));
              Swal.fire({
                icon: "success",
                title: "Hari libur berhasil dihapus!",
                timer: 1200,
                showConfirmButton: false,
              });
            }
          )
        );
      }
    });
  };

  // Handler toggle satu baris
  const handleSelectRow = (row) => {
    setSelectedRows((prev) => {
      const exists = prev.some(
        (r) =>
          r.id === row.id &&
          r.unit_detail_id === row.unit_detail_id &&
          r.tanggal === row.tanggal
      );
      if (exists) {
        return prev.filter(
          (r) =>
            !(
              r.id === row.id &&
              r.unit_detail_id === row.unit_detail_id &&
              r.tanggal === row.tanggal
            )
        );
      } else {
        return [...prev, row];
      }
    });
  };

  // Handler toggle semua
  const handleSelectAll = () => {
    if (selectedRows.length === hariLibur.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(hariLibur);
    }
  };

  // Handler bulk delete
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    Swal.fire({
      title: "Yakin hapus hari libur terpilih?",
      html: `<div style='text-align:left;max-height:120px;overflow:auto'>
        ${selectedRows
          .map(
            (row) =>
              `<div><b>${formatTanggal(row.tanggal)}</b> - ${row.keterangan} (${
                row.unit_detail_name
              })</div>`
          )
          .join("")}
      </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        // Group by tanggal
        const grouped = {};
        selectedRows.forEach((row) => {
          if (!grouped[row.tanggal]) grouped[row.tanggal] = [];
          grouped[row.tanggal].push(row.unit_detail_id);
        });
        // Hapus satu per satu per tanggal
        Promise.all(
          Object.entries(grouped).map(([tanggal, unit_detail_ids]) =>
            dispatch(deleteHariLibur({ unit_detail_ids, tanggal }, null))
          )
        ).then(() => {
          setSelectedRows([]);
          dispatch(fetchHariLibur(bulan, tahun));
          Swal.fire({
            icon: "success",
            title: "Hari libur berhasil dihapus!",
            timer: 1200,
            showConfirmButton: false,
          });
        });
      }
    });
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b-2 border-emerald-200 bg-white flex items-center gap-4">
        <div className="bg-emerald-600 p-2">
          <span className="material-icons text-white text-lg">event_busy</span>
        </div>
        <div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight uppercase">
            Manajemen Hari Libur
          </div>
          <div className="text-emerald-600 text-sm font-medium">
            Kelola hari libur per unit detail
          </div>
        </div>
      </div>
      <div className="mx-auto p-6 max-w-7xl flex flex-col gap-6">
        {/* Multi-date picker section */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg mb-4">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-lg text-emerald-600">
                  date_range
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wide">
                  Pilih Tanggal Libur
                </h2>
                <p className="text-emerald-100 text-xs font-medium">
                  Bisa pilih lebih dari satu tanggal
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <DatePicker
              multiple
              value={selectedDates}
              onChange={(dates) =>
                setSelectedDates(dates.map((d) => d.format("YYYY-MM-DD")))
              }
              format="YYYY-MM-DD"
              style={{ padding: "20px", width: "100%" }}
              placeholder="Pilih tanggal-tanggal libur..."
            />
            {inputRows.length > 0 && (
              <div className="mt-2 flex flex-col gap-3">
                {inputRows.map((row, idx) => (
                  <div
                    key={row.tanggal}
                    className="flex flex-wrap gap-2 items-end bg-emerald-50 border-2 border-emerald-200 p-3 shadow-sm"
                  >
                    <div className="flex flex-col min-w-[120px]">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                        Tanggal
                      </label>
                      <input
                        value={row.tanggal}
                        readOnly
                        className="border-2 border-emerald-300 px-3 py-2 text-sm bg-emerald-25"
                      />
                    </div>
                    <div className="flex flex-col min-w-[180px]">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                        Keterangan
                      </label>
                      <input
                        className="border-2 border-emerald-300 px-3 py-2 text-sm"
                        placeholder="Keterangan (misal: Hari Kemerdekaan)"
                        value={row.keterangan}
                        onChange={(e) => handleKeterangan(e.target.value, idx)}
                        required
                      />
                    </div>
                    <div className="flex flex-col min-w-[220px] flex-1">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                        Unit Detail
                      </label>
                      <Select
                        isMulti
                        options={unitOptions}
                        value={
                          row.unit_detail_ids.length === unitDetails.length
                            ? unitOptions
                            : unitOptions.filter((opt) =>
                                opt.value === "ALL"
                                  ? row.unit_detail_ids.length ===
                                    unitDetails.length
                                  : row.unit_detail_ids.includes(opt.value)
                              )
                        }
                        onChange={(selected) => handleSelectUnit(selected, idx)}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Pilih Unit Detail..."
                      />
                    </div>
                    <div className="flex flex-col justify-end min-w-[100px]">
                      <button
                        type="button"
                        className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs border-2 border-emerald-700 hover:bg-emerald-700 transition shadow-lg"
                        onClick={() => handleTambahBaris(row, idx)}
                        title="Tambah Hari Libur"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {editRow && (
              <div className="mt-2 flex flex-wrap gap-2 items-end bg-yellow-50 border-2 border-yellow-200 p-3 shadow-sm">
                <div className="flex flex-col min-w-[120px]">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                    Tanggal
                  </label>
                  <input
                    value={editRow.tanggal}
                    readOnly
                    className="border-2 border-emerald-300 px-3 py-2 text-sm bg-emerald-25"
                  />
                </div>
                <div className="flex flex-col min-w-[180px]">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                    Keterangan
                  </label>
                  <input
                    className="border-2 border-emerald-300 px-3 py-2 text-sm"
                    placeholder="Keterangan (misal: Hari Kemerdekaan)"
                    value={editRow.keterangan}
                    onChange={(e) =>
                      setEditRow((row) => ({
                        ...row,
                        keterangan: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex flex-col min-w-[220px] flex-1">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">
                    Unit Detail
                  </label>
                  <Select
                    isMulti
                    options={unitOptions}
                    value={
                      editRow.unit_detail_ids.length === unitDetails.length
                        ? unitOptions
                        : unitOptions.filter((opt) =>
                            opt.value === "ALL"
                              ? editRow.unit_detail_ids.length ===
                                unitDetails.length
                              : editRow.unit_detail_ids.includes(opt.value)
                          )
                    }
                    onChange={handleEditSelectUnit}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Pilih Unit Detail..."
                  />
                </div>
                <div className="flex flex-col justify-end min-w-[100px] gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-yellow-500 text-white font-bold text-xs border-2 border-yellow-600 hover:bg-yellow-600 transition shadow"
                    onClick={handleUpdateEdit}
                    title="Update Hari Libur"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 text-gray-700 font-bold text-xs border-2 border-gray-400 hover:bg-gray-400 transition shadow"
                    onClick={() => setEditRow(null)}
                    title="Batal Edit"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Filter Bulan/Tahun */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg mb-4">
          <div className="bg-emerald-50 px-4 py-3 border-b-2 border-emerald-200 flex items-center gap-2">
            <span className="material-icons text-emerald-600 text-lg">
              filter_list
            </span>
            <span className="text-emerald-800 font-black text-sm uppercase tracking-wide">
              Filter Periode
            </span>
          </div>
          <div className="p-4 flex gap-3 items-center">
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
              Bulan:
            </label>
            <select
              className="border-2 border-emerald-300 px-2 py-1 text-sm"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
            >
              {namaBulan.map((nama, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                  {nama}
                </option>
              ))}
            </select>
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wide ml-2">
              Tahun:
            </label>
            <input
              type="number"
              className="border-2 border-emerald-300 px-2 py-1 text-sm w-20"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              min="2000"
              max="2100"
            />
          </div>
        </div>
        {/* Tabel Hari Libur */}
        <div className="bg-white border-2 border-emerald-200 shadow-lg">
          <div className="bg-emerald-600 px-4 py-3 border-b-2 border-emerald-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2">
                <span className="material-icons text-lg text-emerald-600">
                  event_busy
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wide">
                  Daftar Hari Libur
                </h2>
                <p className="text-emerald-100 text-xs font-medium">
                  Data hari libur berdasarkan periode terpilih
                </p>
              </div>
            </div>
            {selectedRows.length > 0 && (
              <button
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs border-2 border-red-700 hover:bg-red-700 transition flex items-center gap-2"
                onClick={handleBulkDelete}
              >
                <span className="material-icons text-base">delete</span>
                Hapus Terpilih
              </button>
            )}
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full text-sm bg-white">
              <thead className="sticky top-0 z-10 bg-emerald-50 border-b-2 border-emerald-200">
                <tr>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-12">
                    No
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-32">
                    Tanggal
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-56">
                    Keterangan
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-32">
                    Unit
                  </th>
                  <th className="px-3 py-2 text-left font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-40">
                    Unit Detail
                  </th>
                  <th className="px-3 py-2 text-center font-black text-emerald-800 text-xs uppercase tracking-wider border-r border-emerald-200 w-24">
                    Aksi
                  </th>
                  <th className="px-3 py-2 text-center w-8">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === hariLibur.length &&
                        hariLibur.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-6 text-emerald-600 font-bold"
                    >
                      <span className="animate-spin inline-block mr-2">⏳</span>
                      Memuat data...
                    </td>
                  </tr>
                ) : hariLibur.length > 0 ? (
                  hariLibur.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-emerald-25"}
                    >
                      <td className="px-3 py-2 text-center align-middle border-b border-emerald-100 font-semibold">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-emerald-100">
                        {formatTanggal(row.tanggal)}
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-emerald-100">
                        {row.keterangan}
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-emerald-100">
                        {row.unit_name}
                      </td>
                      <td className="px-3 py-2 align-middle border-b border-emerald-100">
                        <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 border border-emerald-300 font-bold">
                          {row.unit_detail_name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center align-middle border-b border-emerald-100">
                        <div className="flex gap-1 justify-center">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 transition border border-yellow-200 hover:border-yellow-300"
                            onClick={() => handleEdit(row)}
                            title="Edit Hari Libur"
                          >
                            <span className="material-icons text-sm">edit</span>
                          </button>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 transition border border-red-200 hover:border-red-300"
                            onClick={() => handleDelete(row)}
                            title="Hapus Hari Libur"
                          >
                            <span className="material-icons text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center align-middle border-b border-emerald-100 w-8">
                        <input
                          type="checkbox"
                          checked={selectedRows.some(
                            (r) =>
                              r.id === row.id &&
                              r.unit_detail_id === row.unit_detail_id &&
                              r.tanggal === row.tanggal
                          )}
                          onChange={() => handleSelectRow(row)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mb-2">
                        <span className="material-icons text-emerald-400 text-2xl">
                          event_busy
                        </span>
                      </div>
                      <div className="text-emerald-800 font-black text-xl">
                        Tidak ada data hari libur.
                      </div>
                      <div className="text-emerald-600 text-center max-w-xs text-sm mx-auto">
                        Silakan tambah hari libur baru melalui form di atas.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
