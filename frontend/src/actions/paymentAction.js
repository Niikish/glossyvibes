import {
    CREATE_PAYMENT_REQUEST,
    CREATE_PAYMENT_SUCCESS,
    CREATE_PAYMENT_FAIL,
    VERIFY_PAYMENT_REQUEST,
    VERIFY_PAYMENT_SUCCESS,
    VERIFY_PAYMENT_FAIL,
    CLEAR_ERRORS
} from "../constants/paymentConstants";
import axios from "../utils/axiosConfig"; // Centralized config

export const createRazorpayOrder = (paymentData) => async (dispatch) => {
    try {
        dispatch({ type: CREATE_PAYMENT_REQUEST });

        // axiosConfig already holds baseURL, withCredentials, auth, etc
        const { data } = await axios.post("/api/v1/payment/razorpay/create-order", paymentData);

        dispatch({
            type: CREATE_PAYMENT_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: CREATE_PAYMENT_FAIL,
            payload: error.response?.data?.message || "Payment initiation failed",
        });
    }
};

export const verifyRazorpayPayment = (verificationData) => async (dispatch) => {
    try {
        dispatch({ type: VERIFY_PAYMENT_REQUEST });

        const { data } = await axios.post("/api/v1/payment/razorpay/verify", verificationData);

        dispatch({
            type: VERIFY_PAYMENT_SUCCESS,
            payload: data,
        });

        return data;
    } catch (error) {
        dispatch({
            type: VERIFY_PAYMENT_FAIL,
            payload: error.response?.data?.message || "Payment verification failed",
        });
        return { success: false, message: error.response?.data?.message || "Payment verification failed" };
    }
};

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS,
    });
};
