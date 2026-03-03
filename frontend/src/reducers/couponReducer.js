import {
    ADMIN_COUPONS_REQUEST,
    ADMIN_COUPONS_SUCCESS,
    ADMIN_COUPONS_FAIL,
    NEW_COUPON_REQUEST,
    NEW_COUPON_SUCCESS,
    NEW_COUPON_RESET,
    NEW_COUPON_FAIL,
    COUPON_DETAILS_REQUEST,
    COUPON_DETAILS_SUCCESS,
    COUPON_DETAILS_FAIL,
    UPDATE_COUPON_REQUEST,
    UPDATE_COUPON_SUCCESS,
    UPDATE_COUPON_RESET,
    UPDATE_COUPON_FAIL,
    DELETE_COUPON_REQUEST,
    DELETE_COUPON_SUCCESS,
    DELETE_COUPON_RESET,
    DELETE_COUPON_FAIL,
    APPLY_COUPON_REQUEST,
    APPLY_COUPON_SUCCESS,
    APPLY_COUPON_RESET,
    APPLY_COUPON_FAIL,
    REMOVE_COUPON,
    REDEEM_COUPON_REQUEST,
    REDEEM_COUPON_SUCCESS,
    REDEEM_COUPON_FAIL,
    CLEAR_ERRORS
} from '../constants/couponConstants';

// All Coupons Reducer - ADMIN
export const couponsReducer = (state = { coupons: [] }, action) => {
    switch (action.type) {
        case ADMIN_COUPONS_REQUEST:
            return {
                loading: true,
                coupons: []
            };
        case ADMIN_COUPONS_SUCCESS:
            return {
                loading: false,
                coupons: action.payload
            };
        case ADMIN_COUPONS_FAIL:
            return {
                loading: false,
                error: action.payload
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

// New Coupon Reducer - ADMIN
export const newCouponReducer = (state = { coupon: {} }, action) => {
    switch (action.type) {
        case NEW_COUPON_REQUEST:
            return {
                ...state,
                loading: true
            };
        case NEW_COUPON_SUCCESS:
            return {
                loading: false,
                success: action.payload.success,
                coupon: action.payload.coupon
            };
        case NEW_COUPON_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case NEW_COUPON_RESET:
            return {
                ...state,
                success: false
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

// Coupon Details Reducer - ADMIN
export const couponDetailsReducer = (state = { coupon: {} }, action) => {
    switch (action.type) {
        case COUPON_DETAILS_REQUEST:
            return {
                ...state,
                loading: true
            };
        case COUPON_DETAILS_SUCCESS:
            return {
                loading: false,
                coupon: action.payload
            };
        case COUPON_DETAILS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

// Update Coupon Reducer - ADMIN
export const couponReducer = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_COUPON_REQUEST:
        case DELETE_COUPON_REQUEST:
            return {
                ...state,
                loading: true
            };
        case UPDATE_COUPON_SUCCESS:
            return {
                ...state,
                loading: false,
                isUpdated: action.payload
            };
        case DELETE_COUPON_SUCCESS:
            return {
                ...state,
                loading: false,
                isDeleted: action.payload
            };
        case UPDATE_COUPON_FAIL:
        case DELETE_COUPON_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case UPDATE_COUPON_RESET:
            return {
                ...state,
                isUpdated: false
            };
        case DELETE_COUPON_RESET:
            return {
                ...state,
                isDeleted: false
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

// Apply Coupon Reducer - USER
export const appliedCouponReducer = (state = { discount: {} }, action) => {
    switch (action.type) {
        case APPLY_COUPON_REQUEST:
            return {
                ...state,
                loading: true
            };
        case APPLY_COUPON_SUCCESS:
            return {
                loading: false,
                success: true,
                discount: {
                    code: action.payload.code,
                    amount: action.payload.amount,
                    discountAmount: action.payload.discountAmount,
                    finalAmount: action.payload.finalAmount
                }
            };
        case APPLY_COUPON_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case APPLY_COUPON_RESET:
            return {
                ...state,
                success: false
            };
        case REMOVE_COUPON:
            return {
                ...state,
                success: false,
                discount: {}
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

// Redeem Coupon Reducer - for recording coupon usage
export const redeemCouponReducer = (state = {}, action) => {
    switch (action.type) {
        case REDEEM_COUPON_REQUEST:
            return {
                ...state,
                loading: true
            };
        case REDEEM_COUPON_SUCCESS:
            return {
                loading: false,
                success: true,
                message: action.payload.message
            };
        case REDEEM_COUPON_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
}; 