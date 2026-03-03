import axios from '../utils/axiosConfig';
import {
    ADMIN_COUPONS_REQUEST,
    ADMIN_COUPONS_SUCCESS,
    ADMIN_COUPONS_FAIL,
    NEW_COUPON_REQUEST,
    NEW_COUPON_SUCCESS,
    NEW_COUPON_FAIL,
    COUPON_DETAILS_REQUEST,
    COUPON_DETAILS_SUCCESS,
    COUPON_DETAILS_FAIL,
    UPDATE_COUPON_REQUEST,
    UPDATE_COUPON_SUCCESS,
    UPDATE_COUPON_FAIL,
    DELETE_COUPON_REQUEST,
    DELETE_COUPON_SUCCESS,
    DELETE_COUPON_FAIL,
    APPLY_COUPON_REQUEST,
    APPLY_COUPON_SUCCESS,
    APPLY_COUPON_FAIL,
    REMOVE_COUPON,
    REDEEM_COUPON_REQUEST,
    REDEEM_COUPON_SUCCESS,
    REDEEM_COUPON_FAIL,
    CLEAR_ERRORS
} from '../constants/couponConstants';

// Get all coupons - ADMIN
export const getCoupons = () => async (dispatch) => {
    try {
        dispatch({ type: ADMIN_COUPONS_REQUEST });

        const { data } = await axios.get('/api/v1/admin/coupons');

        dispatch({
            type: ADMIN_COUPONS_SUCCESS,
            payload: data.coupons
        });
    } catch (error) {
        dispatch({
            type: ADMIN_COUPONS_FAIL,
            payload: error.response.data.message
        });
    }
};

// Create new coupon - ADMIN
export const createCoupon = (couponData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_COUPON_REQUEST });

        const config = {
            headers: { 'Content-Type': 'application/json' }
        };

        const { data } = await axios.post(
            '/api/v1/admin/coupon/new',
            couponData,
            config
        );

        dispatch({
            type: NEW_COUPON_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: NEW_COUPON_FAIL,
            payload: error.response.data.message
        });
    }
};

// Get coupon details - ADMIN
export const getCouponDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: COUPON_DETAILS_REQUEST });

        const { data } = await axios.get(`/api/v1/admin/coupon/${id}`);

        dispatch({
            type: COUPON_DETAILS_SUCCESS,
            payload: data.coupon
        });
    } catch (error) {
        dispatch({
            type: COUPON_DETAILS_FAIL,
            payload: error.response.data.message
        });
    }
};

// Update coupon - ADMIN
export const updateCoupon = (id, couponData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_COUPON_REQUEST });

        const config = {
            headers: { 'Content-Type': 'application/json' }
        };

        const { data } = await axios.put(
            `/api/v1/admin/coupon/${id}`,
            couponData,
            config
        );

        dispatch({
            type: UPDATE_COUPON_SUCCESS,
            payload: data.success
        });
    } catch (error) {
        dispatch({
            type: UPDATE_COUPON_FAIL,
            payload: error.response.data.message
        });
    }
};

// Delete coupon - ADMIN
export const deleteCoupon = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_COUPON_REQUEST });

        const { data } = await axios.delete(`/api/v1/admin/coupon/${id}`);

        dispatch({
            type: DELETE_COUPON_SUCCESS,
            payload: data.success
        });
    } catch (error) {
        dispatch({
            type: DELETE_COUPON_FAIL,
            payload: error.response.data.message
        });
    }
};

// Apply coupon - USER
export const applyCoupon = (code, amount) => async (dispatch) => {
    try {
        dispatch({ type: APPLY_COUPON_REQUEST });

        const config = {
            headers: { 'Content-Type': 'application/json' }
        };

        const { data } = await axios.post(
            '/api/v1/coupon/apply',
            { code, amount },
            config
        );

        dispatch({
            type: APPLY_COUPON_SUCCESS,
            payload: data
        });
    } catch (error) {
        dispatch({
            type: APPLY_COUPON_FAIL,
            payload: error.response.data.message
        });
    }
};

// Remove applied coupon - USER
export const removeCoupon = () => async (dispatch) => {
    dispatch({ type: REMOVE_COUPON });
};

// Redeem coupon (increment usage count) - to be called after successful order
export const redeemCoupon = (code) => async (dispatch) => {
    if (!code) {
        console.error('No coupon code provided for redemption');
        return false;
    }

    try {
        console.log('Starting coupon redemption for code:', code);
        dispatch({ type: REDEEM_COUPON_REQUEST });

        // Add a slight delay to ensure order creation is complete
        await new Promise(resolve => setTimeout(resolve, 500));

        const config = {
            headers: { 'Content-Type': 'application/json' }
        };

        const { data } = await axios.post(
            '/api/v1/coupon/redeem',
            { code },
            config
        );

        console.log('Redemption API response:', data);
        dispatch({
            type: REDEEM_COUPON_SUCCESS,
            payload: data
        });
        
        // Force refresh coupon data in admin panel
        if (window.location.pathname.includes('/admin/coupons')) {
            dispatch(getCoupons());
        }
        
        return true;
    } catch (error) {
        console.error('Coupon redemption failed:', error.response ? error.response.data : error.message);
        dispatch({
            type: REDEEM_COUPON_FAIL,
            payload: error.response && error.response.data.message 
                ? error.response.data.message 
                : error.message
        });
        
        return false;
    }
};

// Clear all errors
export const clearErrors = () => async (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
}; 
