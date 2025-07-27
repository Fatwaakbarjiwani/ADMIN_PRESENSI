import {
  FETCH_UNIT_REQUEST,
  FETCH_UNIT_SUCCESS,
  FETCH_UNIT_FAILURE,
  CREATE_UNIT_REQUEST,
  CREATE_UNIT_SUCCESS,
  CREATE_UNIT_FAILURE,
  UPDATE_UNIT_REQUEST,
  UPDATE_UNIT_SUCCESS,
  UPDATE_UNIT_FAILURE,
  DELETE_UNIT_REQUEST,
  DELETE_UNIT_SUCCESS,
  DELETE_UNIT_FAILURE,
} from "../actions/unitAction";

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const unitReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_UNIT_REQUEST:
    case CREATE_UNIT_REQUEST:
    case UPDATE_UNIT_REQUEST:
    case DELETE_UNIT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_UNIT_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };

    case CREATE_UNIT_SUCCESS:
      return {
        ...state,
        loading: false,
        data: [...state.data, action.payload],
        error: null,
      };

    case UPDATE_UNIT_SUCCESS:
      return {
        ...state,
        loading: false,
        data: state.data.map((unit) =>
          unit.id === action.payload.id ? action.payload : unit
        ),
        error: null,
      };

    case DELETE_UNIT_SUCCESS:
      return {
        ...state,
        loading: false,
        data: state.data.filter((unit) => unit.id !== action.payload),
        error: null,
      };

    case FETCH_UNIT_FAILURE:
    case CREATE_UNIT_FAILURE:
    case UPDATE_UNIT_FAILURE:
    case DELETE_UNIT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default unitReducer;
