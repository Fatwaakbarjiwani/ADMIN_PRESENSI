import { useState } from "react";

const dummyPreview = [
  { id: 1, nipy: "11020477", nama: "YULIA SAPTA A. Md. Ak", shift: "SHF PAGI", tanggal: "2024-06-01" },
  { id: 2, nipy: "10015250", nama: "HANDAYANI", shift: "SHF PAGI", tanggal: "2024-06-01" },
];

export default function ImportDataCSV() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(dummyPreview);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    // Simulasi preview, pada implementasi asli lakukan parsing CSV di sini
    setPreview(dummyPreview);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    // Proses upload file di sini
    alert("File berhasil diupload (simulasi)");
  };

  return (
    <div className="w-full min-h-screen font-sans bg-gray-50">
      {/* Header */}
      <div className="px-4 sticky z-40 top-0 py-4 border-b border-gray-200 bg-white flex items-center gap-4">
        <span className="material-icons text-lg text-green-200 bg-primary p-2 rounded opacity-80">upload_file</span>
        <div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight drop-shadow-sm uppercase">Import Data CSV</div>
          <div className="text-gray-600 text-base font-medium">Upload dan preview data pegawai/dosen dari file CSV</div>
        </div>
      </div>
      <div className="mx-auto p-4 max-w-5xl flex flex-col gap-8 px-2 md:px-0">
        <div className="border border-gray-300 bg-white p-4">
          <form className="flex flex-col gap-4 mb-6" onSubmit={handleUpload}>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Pilih file CSV</label>
              <input type="file" accept=".csv" onChange={handleFileChange} className="block text-xs" />
            </div>
            <div className="text-xs text-gray-500">Pastikan file berformat .csv dan sesuai template yang disediakan.</div>
            <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow text-xs w-max">Upload</button>
          </form>
          <div className="mb-2 text-xs font-semibold text-gray-700">Preview Data:</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border border-gray-200 rounded-md overflow-hidden shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-gray-500">No</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-500">NIPY</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-500">Nama</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-500">Shift</th>
                  <th className="px-3 py-2 text-left font-bold text-gray-500">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2">{row.nipy}</td>
                    <td className="px-3 py-2">{row.nama}</td>
                    <td className="px-3 py-2">{row.shift}</td>
                    <td className="px-3 py-2">{row.tanggal}</td>
                  </tr>
                ))}
                {preview.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-4">Tidak ada data preview.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-500 mt-2">Menampilkan {preview.length} data preview</div>
        </div>
      </div>
    </div>
  );
} 