import { combineReducers } from "redux";
import authReducer from "./authReducer";
import shiftReducer from "./shiftReducer";
import izinReducer from "./izinReducer";
import unitDetailReducer from "./unitDetailReducer";
import presensiReducer from "./presensiReducer";

export default combineReducers({
  auth: authReducer,
  shift: shiftReducer,
  unitDetail: unitDetailReducer,
  presensi: presensiReducer,
  izin: izinReducer,
});
