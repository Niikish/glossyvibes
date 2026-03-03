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

export const adminStatsReducer = (state = { stats: {} }, { type, payload }) => {
    switch (type) {
        case ADMIN_STATS_REQUEST:
            return {
                loading: true,
                stats: {},
            };
        case ADMIN_STATS_SUCCESS:
            return {
                loading: false,
                stats: payload,
            };
        case ADMIN_STATS_FAIL:
            return {
                loading: false,
                error: payload,
            };
        default:
            return state;
    }
};

export const paymentAnalyticsReducer = (state = { stats: {}, timeSeriesData: [] }, { type, payload }) => {
    switch (type) {
        case ADMIN_PAYMENT_STATS_REQUEST:
            return {
                loading: true,
                stats: {},
                timeSeriesData: []
            };
        case ADMIN_PAYMENT_STATS_SUCCESS:
            return {
                loading: false,
                stats: payload.stats,
                timeSeriesData: payload.timeSeriesData
            };
        case ADMIN_PAYMENT_STATS_FAIL:
            return {
                loading: false,
                error: payload,
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

export const settlementsReducer = (state = { settlements: [] }, { type, payload }) => {
    switch (type) {
        case ADMIN_SETTLEMENTS_REQUEST:
            return {
                loading: true,
                settlements: []
            };
        case ADMIN_SETTLEMENTS_SUCCESS:
            return {
                loading: false,
                settlements: payload
            };
        case ADMIN_SETTLEMENTS_FAIL:
            return {
                loading: false,
                error: payload,
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
