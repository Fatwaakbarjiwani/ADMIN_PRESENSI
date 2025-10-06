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
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">
          event_busy
        </span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">
            Manajemen Hari Libur
          </div>
          <div className="text-gray-600 text-base font-medium">
            Kelola hari libur per unit detail
          </div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        {/* Multi-date picker section */}
        <div className="border border-gray-200 bg-white p-6 shadow flex flex-col gap-4 mb-4">
          <div className="font-bold text-emerald-700 text-lg mb-2 flex items-center gap-2">
            <span className="material-icons text-emerald-600 text-2xl">
              date_range
            </span>
            Pilih Tanggal Libur{" "}
            <span className="text-sm font-thin align-text-bottom">
              (bisa lebih dari satu)
            </span>
          </div>
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
          {/* Render baris input untuk setiap tanggal yang dipilih */}
          {inputRows.length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              {inputRows.map((row, idx) => (
                <div
                  key={row.tanggal}
                  className="flex flex-wrap gap-2 items-end bg-emerald-50 border border-emerald-100 rounded p-3 shadow-sm"
                >
                  <div className="flex flex-col min-w-[120px]">
                    <label className="text-xs font-semibold text-gray-600 mb-1">
                      Tanggal
                    </label>
                    <input
                      value={row.tanggal}
                      readOnly
                      className="border border-gray-300 px-3 py-2 text-sm rounded bg-gray-100"
                    />
                  </div>
                  <div className="flex flex-col min-w-[180px]">
                    <label className="text-xs font-semibold text-gray-600 mb-1">
                      Keterangan
                    </label>
                    <input
                      className="border border-gray-300 px-3 py-2 text-sm rounded"
                      placeholder="Keterangan (misal: Hari Kemerdekaan)"
                      value={row.keterangan}
                      onChange={(e) => handleKeterangan(e.target.value, idx)}
                      required
                    />
                  </div>
                  <div className="flex flex-col min-w-[220px] flex-1">
                    <label className="text-xs font-semibold text-gray-600 mb-1">
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
                      className="px-4 py-2 font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow"
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
          {/* Edit baris jika ada */}
          {editRow && (
            <div className="mt-4 flex flex-wrap gap-2 items-end bg-yellow-50 border border-yellow-200 rounded p-3 shadow-sm">
              <div className="flex flex-col min-w-[120px]">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Tanggal
                </label>
                <input
                  value={editRow.tanggal}
                  readOnly
                  className="border border-gray-300 px-3 py-2 text-sm rounded bg-gray-100"
                />
              </div>
              <div className="flex flex-col min-w-[180px]">
                <label className="text-xs font-semibold text-gray-600 mb-1">
                  Keterangan
                </label>
                <input
                  className="border border-gray-300 px-3 py-2 text-sm rounded"
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
                <label className="text-xs font-semibold text-gray-600 mb-1">
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
                  className="px-4 py-2 font-bold text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow"
                  onClick={handleUpdateEdit}
                  title="Update Hari Libur"
                >
                  Update
                </button>
                <button
                  type="button"
                  className="px-4 py-2 font-bold text-sm bg-gray-300 hover:bg-gray-400 text-gray-700 rounded shadow"
                  onClick={() => setEditRow(null)}
                  title="Batal Edit"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Filter Bulan/Tahun */}
        <div className="flex gap-2 items-center bg-white p-3 rounded shadow border border-gray-200">
          <label className="text-xs font-semibold text-gray-600">Bulan:</label>
          <select
            className="border border-gray-300 px-2 py-1 text-sm rounded"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
          >
            {namaBulan.map((nama, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                {nama}
              </option>
            ))}
          </select>
          <label className="text-xs font-semibold text-gray-600 ml-2">
            Tahun:
          </label>
          <input
            type="number"
            className="border border-gray-300 px-2 py-1 text-sm w-20 rounded"
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            min="2000"
            max="2100"
          />
        </div>
        {/* Tabel Hari Libur */}
        <div className="border border-gray-200 bg-white p-6 shadow flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="font-bold text-emerald-600 mb-2 text-xl flex items-center gap-2">
              <span className="material-icons text-emerald-600 text-2xl">
                event_busy
              </span>
              Daftar Hari Libur
            </div>
            {selectedRows.length > 0 && (
              <div className="mb-2 flex justify-end">
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-sm flex items-center gap-2"
                  onClick={handleBulkDelete}
                >
                  <span className="material-icons text-base">delete</span> Hapus
                  Terpilih
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white">
              <thead className="sticky top-0 z-10 bg-white border-b-2 border-emerald-100">
                <tr>
                  <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-12">
                    No
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                    Tanggal
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-56">
                    Keterangan
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                    Unit
                  </th>
                  <th className="px-2 py-3 text-left font-extrabold text-emerald-700 tracking-wide text-base uppercase w-32">
                    Unit Detail
                  </th>
                  <th className="px-2 py-3 text-center font-extrabold text-emerald-700 tracking-wide text-base uppercase w-24">
                    Aksi
                  </th>
                  <th className="px-2 py-3 text-center w-8">
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
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-2 py-3 text-center align-middle border-b border-gray-100 font-semibold">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-3 align-middle border-b border-gray-100">
                        {formatTanggal(row.tanggal)}
                      </td>
                      <td className="px-2 py-3 align-middle border-b border-gray-100">
                        {row.keterangan}
                      </td>
                      <td className="px-2 py-3 align-middle border-b border-gray-100">
                        {row.unit_name}
                      </td>
                      <td className="px-2 py-3 align-middle border-b border-gray-100">
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-semibold">
                          {row.unit_detail_name}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center align-middle border-b border-gray-100 flex gap-1 justify-center">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-yellow-600 hover:text-yellow-800 rounded transition"
                          onClick={() => handleEdit(row)}
                          title="Edit Hari Libur"
                        >
                          <span className="material-icons text-base">edit</span>
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 rounded transition"
                          onClick={() => handleDelete(row)}
                          title="Hapus Hari Libur"
                        >
                          <span className="material-icons text-base">
                            delete
                          </span>
                        </button>
                      </td>
                      <td className="px-2 py-3 text-center align-middle border-b border-gray-100 w-8">
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
                    <td colSpan={7} className="text-center text-gray-400 py-8">
                      <span className="material-icons text-5xl mb-2 text-emerald-100">
                        event_busy
                      </span>
                      <div className="font-bold text-emerald-600 text-lg">
                        Tidak ada data hari libur.
                      </div>
                      <div className="text-gray-500 text-sm">
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
