import axios from '../utils/axiosConfig';
import {
    ALL_CATEGORIES_REQUEST,
    ALL_CATEGORIES_SUCCESS,
    ALL_CATEGORIES_FAIL,
    CATEGORY_DETAILS_REQUEST,
    CATEGORY_DETAILS_SUCCESS,
    CATEGORY_DETAILS_FAIL,
    NEW_CATEGORY_REQUEST,
    NEW_CATEGORY_SUCCESS,
    NEW_CATEGORY_FAIL,
    UPDATE_CATEGORY_REQUEST,
    UPDATE_CATEGORY_SUCCESS,
    UPDATE_CATEGORY_FAIL,
    DELETE_CATEGORY_REQUEST,
    DELETE_CATEGORY_SUCCESS,
    DELETE_CATEGORY_FAIL,
    CLEAR_ERRORS,
    MAIN_CATEGORIES_REQUEST,
    MAIN_CATEGORIES_SUCCESS,
    MAIN_CATEGORIES_FAIL,
    SUB_CATEGORIES_REQUEST,
    SUB_CATEGORIES_SUCCESS,
    SUB_CATEGORIES_FAIL,
} from '../constants/categoryConstants';

// Get All Categories
export const getCategories = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_CATEGORIES_REQUEST });

        const { data } = await axios.get('/api/v1/categories');

        dispatch({
            type: ALL_CATEGORIES_SUCCESS,
            payload: data.categories,
        });
    } catch (error) {
        dispatch({
            type: ALL_CATEGORIES_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Get Main Categories Only
export const getMainCategories = () => async (dispatch) => {
    try {
        dispatch({ type: MAIN_CATEGORIES_REQUEST });

        const { data } = await axios.get('/api/v1/categories/main');

        dispatch({
            type: MAIN_CATEGORIES_SUCCESS,
            payload: data.categories,
        });
    } catch (error) {
        dispatch({
            type: MAIN_CATEGORIES_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Get Sub Categories of a Parent
export const getSubCategories = (parentId) => async (dispatch) => {
    try {
        dispatch({ type: SUB_CATEGORIES_REQUEST });

        const { data } = await axios.get(`/api/v1/categories/sub/${parentId}`);

        dispatch({
            type: SUB_CATEGORIES_SUCCESS,
            payload: data.categories,
        });
    } catch (error) {
        dispatch({
            type: SUB_CATEGORIES_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Get Category Details
export const getCategoryDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: CATEGORY_DETAILS_REQUEST });

        const { data } = await axios.get(`/api/v1/category/${id}`);

        dispatch({
            type: CATEGORY_DETAILS_SUCCESS,
            payload: data.category,
        });
    } catch (error) {
        dispatch({
            type: CATEGORY_DETAILS_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Create Category -- ADMIN
export const createCategory = (categoryData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_CATEGORY_REQUEST });

        const config = { headers: { "Content-Type": "application/json" } };

        const { data } = await axios.post(
            '/api/v1/admin/category/new',
            categoryData,
            config
        );

        dispatch({
            type: NEW_CATEGORY_SUCCESS,
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: NEW_CATEGORY_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Update Category -- ADMIN
export const updateCategory = (id, categoryData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_CATEGORY_REQUEST });

        const config = { headers: { "Content-Type": "application/json" } };

        const { data } = await axios.put(
            `/api/v1/admin/category/${id}`,
            categoryData,
            config
        );

        dispatch({
            type: UPDATE_CATEGORY_SUCCESS,
            payload: data.success,
        });
    } catch (error) {
        dispatch({
            type: UPDATE_CATEGORY_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Delete Category -- ADMIN
export const deleteCategory = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_CATEGORY_REQUEST });

        const { data } = await axios.delete(`/api/v1/admin/category/${id}`);

        dispatch({
            type: DELETE_CATEGORY_SUCCESS,
            payload: data.success,
        });
    } catch (error) {
        dispatch({
            type: DELETE_CATEGORY_FAIL,
            payload: error.response?.data?.message || "Something went wrong",
        });
    }
};

// Clear Errors
export const clearErrors = () => async (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
}; 
