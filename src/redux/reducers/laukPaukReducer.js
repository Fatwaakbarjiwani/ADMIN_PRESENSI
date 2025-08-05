import {
  FETCH_LAUK_PAUK_REQUEST,
  FETCH_LAUK_PAUK_SUCCESS,
  FETCH_LAUK_PAUK_FAILURE,
  CREATE_LAUK_PAUK_REQUEST,
  CREATE_LAUK_PAUK_SUCCESS,
  CREATE_LAUK_PAUK_FAILURE,
  UPDATE_LAUK_PAUK_REQUEST,
  UPDATE_LAUK_PAUK_SUCCESS,
  UPDATE_LAUK_PAUK_FAILURE,
  DELETE_LAUK_PAUK_REQUEST,
  DELETE_LAUK_PAUK_SUCCESS,
  DELETE_LAUK_PAUK_FAILURE,
} from "../actions/laukPaukAction";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export default function laukPaukReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_LAUK_PAUK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_LAUK_PAUK_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case FETCH_LAUK_PAUK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case CREATE_LAUK_PAUK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case CREATE_LAUK_PAUK_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case CREATE_LAUK_PAUK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case UPDATE_LAUK_PAUK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case UPDATE_LAUK_PAUK_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case UPDATE_LAUK_PAUK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case DELETE_LAUK_PAUK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case DELETE_LAUK_PAUK_SUCCESS:
      return {
        ...state,
        loading: false,
        data: null,
        error: null,
      };
    case DELETE_LAUK_PAUK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}
