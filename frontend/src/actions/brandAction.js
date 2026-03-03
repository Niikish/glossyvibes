import axios from '../utils/axiosConfig';
import {
    ALL_BRANDS_REQUEST,
    ALL_BRANDS_SUCCESS,
    ALL_BRANDS_FAIL,
    FEATURED_BRANDS_REQUEST,
    FEATURED_BRANDS_SUCCESS,
    FEATURED_BRANDS_FAIL,
    NEW_BRAND_REQUEST,
    NEW_BRAND_SUCCESS,
    NEW_BRAND_FAIL,
    UPDATE_BRAND_REQUEST,
    UPDATE_BRAND_SUCCESS,
    UPDATE_BRAND_FAIL,
    DELETE_BRAND_REQUEST,
    DELETE_BRAND_SUCCESS,
    DELETE_BRAND_FAIL,
    CLEAR_ERRORS,
} from "../constants/brandConstants";

// Get All Brands
export const getAllBrands = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_BRANDS_REQUEST });

        const { data } = await axios.get('/api/v1/brands');

        dispatch({
            type: ALL_BRANDS_SUCCESS,
            payload: data.brands,
        });
    } catch (error) {
        dispatch({
            type: ALL_BRANDS_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Get Featured Brands
export const getFeaturedBrands = () => async (dispatch) => {
    try {
        dispatch({ type: FEATURED_BRANDS_REQUEST });

        const { data } = await axios.get('/api/v1/brands/featured');

        dispatch({
            type: FEATURED_BRANDS_SUCCESS,
            payload: data.brands,
        });
    } catch (error) {
        dispatch({
            type: FEATURED_BRANDS_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Create Brand
export const createBrand = (brandData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_BRAND_REQUEST });

        const config = { headers: { "Content-Type": "application/json" } };

        const { data } = await axios.post('/api/v1/admin/brand/new', brandData, config);

        dispatch({
            type: NEW_BRAND_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: NEW_BRAND_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Update Brand
export const updateBrand = (id, brandData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_BRAND_REQUEST });

        const config = { headers: { "Content-Type": "application/json" } };

        const { data } = await axios.put(`/api/v1/admin/brand/${id}`, brandData, config);

        dispatch({
            type: UPDATE_BRAND_SUCCESS,
            payload: data.success,
        });
    } catch (error) {
        dispatch({
            type: UPDATE_BRAND_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Delete Brand
export const deleteBrand = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_BRAND_REQUEST });

        const { data } = await axios.delete(`/api/v1/admin/brand/${id}`);

        dispatch({
            type: DELETE_BRAND_SUCCESS,
            payload: data.success,
        });
    } catch (error) {
        dispatch({
            type: DELETE_BRAND_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Clear Errors
export const clearErrors = () => async (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
}; 
