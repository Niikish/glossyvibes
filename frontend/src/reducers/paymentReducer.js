import {
    CREATE_PAYMENT_REQUEST,
    CREATE_PAYMENT_SUCCESS,
    CREATE_PAYMENT_FAIL,
    VERIFY_PAYMENT_REQUEST,
    VERIFY_PAYMENT_SUCCESS,
    VERIFY_PAYMENT_FAIL,
    CLEAR_ERRORS
} from "../constants/paymentConstants";

export const paymentReducer = (state = {}, action) => {
    switch (action.type) {
        case CREATE_PAYMENT_REQUEST:
        case VERIFY_PAYMENT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case CREATE_PAYMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                orderData: action.payload,
            };
        case VERIFY_PAYMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                paymentVerification: action.payload,
            };
        case CREATE_PAYMENT_FAIL:
        case VERIFY_PAYMENT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};
