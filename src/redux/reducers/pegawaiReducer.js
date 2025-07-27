import {
  FETCH_PEGAWAI_REQUEST,
  FETCH_PEGAWAI_SUCCESS,
  FETCH_PEGAWAI_FAILURE,
} from "../actions/pegawaiAction";

const initialState = {
  data: [],
  loading: false,
  error: null,
  pagination: {
    last_page: 1,
    current_page: 1,
    links: [],
  },
};

export default function pegawaiReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_PEGAWAI_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_PEGAWAI_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload.data,
        pagination: action.payload.pagination || initialState.pagination,
        error: null,
      };
    case FETCH_PEGAWAI_FAILURE:
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}
