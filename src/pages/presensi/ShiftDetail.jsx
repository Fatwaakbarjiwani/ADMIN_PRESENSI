import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchShifts,
  createShiftDetail,
  updateShiftDetail,
} from "../../redux/actions/shiftAction";

const defaultDetail = {
  senin_masuk: "",
  senin_pulang: "",
  selasa_masuk: "",
  selasa_pulang: "",
  rabu_masuk: "",
  rabu_pulang: "",
  kamis_masuk: "",
  kamis_pulang: "",
  jumat_masuk: "",
  jumat_pulang: "",
  sabtu_masuk: "",
  sabtu_pulang: "",
  minggu_masuk: "",
  minggu_pulang: "",
  toleransi_terlambat: "",
  toleransi_pulang: "",
};

export default function ShiftDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: shifts, loading } = useSelector((state) => state.shift);
  const [detail, setDetail] = useState(defaultDetail);
  const [shift, setShift] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchShifts());
  }, [dispatch]);

  useEffect(() => {
    if (shifts && id) {
      const found = shifts.find((s) => String(s.id) === String(id));
      setShift(found);

      if (found && found.shift_detail) {
        setDetail({ ...defaultDetail, ...found.shift_detail });
        setIsEdit(true);
      } else {
        setDetail(defaultDetail);
        setIsEdit(false);
      }
    }
  }, [shifts, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetail((d) => ({ ...d, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    const action = isEdit ? updateShiftDetail : createShiftDetail;
    const payload = { shift_id: id, ...detail };
    dispatch(
      action(id, payload, () => {
        navigate(-1);
      })
    ).finally(() => setSaving(false));
  };

  if (loading || !shift) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-2" />
        <div className="text-emerald-700 font-bold">Memuat detail shift...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          className="text-emerald-600 hover:underline flex items-center"
          onClick={() => navigate(-1)}
        >
          <span className="material-icons align-middle mr-1">arrow_back</span>
          Kembali
        </button>
        <h2 className="text-3xl font-bold text-emerald-700 flex-1 flex items-center gap-2">
          <span className="material-icons text-emerald-500">schedule</span>
          Atur Detail Shift
        </h2>
      </div>
      <div className="mb-2 text-gray-500 text-sm">
        Shift: <span className="font-semibold text-gray-700">{shift.name}</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"].map(
            (hari) => (
              <div
                key={hari}
                className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2 shadow-sm"
              >
                <span className="capitalize font-semibold text-emerald-700 mb-1">
                  {hari}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-16">Masuk</label>
                  <input
                    type="time"
                    name={`${hari}_masuk`}
                    className="border rounded px-2 py-1 text-xs flex-1"
                    value={detail[`${hari}_masuk`] || ""}
                    onChange={handleChange}
                    placeholder="Masuk"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 w-16">Pulang</label>
                  <input
                    type="time"
                    name={`${hari}_pulang`}
                    className="border rounded px-2 py-1 text-xs flex-1"
                    value={detail[`${hari}_pulang`] || ""}
                    onChange={handleChange}
                    placeholder="Pulang"
                  />
                </div>
              </div>
            )
          )}
        </div>
        <hr className="my-4" />
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">
              Toleransi Terlambat
            </span>
            <input
              type="number"
              name="toleransi_terlambat"
              className="border rounded px-2 py-1 text-xs w-20"
              value={detail.toleransi_terlambat || ""}
              onChange={handleChange}
              placeholder="menit"
              min={0}
            />
            <span className="text-xs text-gray-400">menit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">
              Toleransi Pulang
            </span>
            <input
              type="number"
              name="toleransi_pulang"
              className="border rounded px-2 py-1 text-xs w-20"
              value={detail.toleransi_pulang || ""}
              onChange={handleChange}
              placeholder="menit"
              min={0}
            />
            <span className="text-xs text-gray-400">menit</span>
          </div>
        </div>
        <button
          type="submit"
          className={`px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded mt-4 flex items-center gap-2 ${
            saving ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={saving}
        >
          {saving && (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          )}
          {saving
            ? "Menyimpan..."
            : isEdit
            ? "Update Detail Shift"
            : "Simpan Detail Shift"}
        </button>
      </form>
    </div>
  );
}
