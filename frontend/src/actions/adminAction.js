import axios from '../utils/axiosConfig';
import {
    ADMIN_STATS_REQUEST,
    ADMIN_STATS_SUCCESS,
    ADMIN_STATS_FAIL,
    ADMIN_PAYMENT_STATS_REQUEST,
    ADMIN_PAYMENT_STATS_SUCCESS,
    ADMIN_PAYMENT_STATS_FAIL,
    ADMIN_SETTLEMENTS_REQUEST,
    ADMIN_SETTLEMENTS_SUCCESS,
    ADMIN_SETTLEMENTS_FAIL,
    CLEAR_ERRORS
} from "../constants/adminConstants";

// GET /api/v1/admin/stats — aggregated dashboard analytics
export const getAdminStats = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_STATS_REQUEST });
        const { data } = await axios.get("/api/v1/admin/stats");
        dispatch({ type: ADMIN_STATS_SUCCESS, payload: data.stats });
    } catch (error) {
        dispatch({
            type: ADMIN_STATS_FAIL,
            payload: error.response?.data?.message || "Failed to fetch admin stats",
        });
    }
};

export const getPaymentStats = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_PAYMENT_STATS_REQUEST });
        const { data } = await axios.get("/api/v1/admin/payment/stats");
        dispatch({ type: ADMIN_PAYMENT_STATS_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: ADMIN_PAYMENT_STATS_FAIL,
            payload: error.response?.data?.message || "Failed to fetch payment stats",
        });
    }
};

export const getSettlements = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_SETTLEMENTS_REQUEST });
        const { data } = await axios.get("/api/v1/admin/settlements");
        dispatch({ type: ADMIN_SETTLEMENTS_SUCCESS, payload: data.settlements });
    } catch (error) {
        dispatch({
            type: ADMIN_SETTLEMENTS_FAIL,
            payload: error.response?.data?.message || "Failed to fetch settlements",
        });
    }
};

export const clearErrors = () => async (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
};
