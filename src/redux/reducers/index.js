import { combineReducers } from "redux";
import authReducer from "./authReducer";
import shiftReducer from "./shiftReducer";
import izinReducer from "./izinReducer";
import unitDetailReducer from "./unitDetailReducer";
import presensiReducer from "./presensiReducer";
import pegawaiReducer from "./pegawaiReducer";
import adminReducer from "./adminReducer";
import unitReducer from "./unitReducer";

export default combineReducers({
  auth: authReducer,
  shift: shiftReducer,
  unitDetail: unitDetailReducer,
  presensi: presensiReducer,
  izin: izinReducer,
  pegawai: pegawaiReducer,
  admin: adminReducer,
  unit: unitReducer,
});
