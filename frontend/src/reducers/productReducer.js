import {
    ADMIN_PRODUCTS_FAIL,
    ADMIN_PRODUCTS_REQUEST,
    ADMIN_PRODUCTS_SUCCESS,
    ALL_PRODUCTS_FAIL,
    ALL_PRODUCTS_REQUEST,
    ALL_PRODUCTS_SUCCESS,
    CLEAR_ERRORS,
    DELETE_PRODUCT_FAIL,
    DELETE_PRODUCT_REQUEST,
    DELETE_PRODUCT_RESET,
    DELETE_PRODUCT_SUCCESS,
    NEW_PRODUCT_FAIL,
    NEW_PRODUCT_REQUEST,
    NEW_PRODUCT_RESET,
    NEW_PRODUCT_SUCCESS,
    NEW_REVIEW_FAIL,
    NEW_REVIEW_REQUEST,
    NEW_REVIEW_RESET,
    NEW_REVIEW_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    UPDATE_PRODUCT_FAIL,
    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_RESET,
    UPDATE_PRODUCT_SUCCESS,
    REMOVE_PRODUCT_DETAILS,
    ALL_REVIEWS_REQUEST,
    ALL_REVIEWS_SUCCESS,
    ALL_REVIEWS_FAIL,
    DELETE_REVIEW_REQUEST,
    DELETE_REVIEW_SUCCESS,
    DELETE_REVIEW_RESET,
    DELETE_REVIEW_FAIL,
    SLIDER_PRODUCTS_FAIL,
    SLIDER_PRODUCTS_REQUEST,
    SLIDER_PRODUCTS_SUCCESS,
} from "../constants/productConstants";

// Initial states
const productsInitialState = {
    products: [],
    loading: false,
    error: null,
    productsCount: 0,
    resultPerPage: 0,
    filteredProductsCount: 0
};

const productDetailsInitialState = {
    product: {},
    loading: false,
    error: null
};

export const productsReducer = (state = productsInitialState, { type, payload }) => {
    switch (type) {
        case ALL_PRODUCTS_REQUEST:
        case ADMIN_PRODUCTS_REQUEST:
        case SLIDER_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
                products: []
            };
        case ALL_PRODUCTS_SUCCESS:
            return {
                loading: false,
                products: Array.isArray(payload.products) ? payload.products : [],
                productsCount: Number(payload.productsCount) || 0,
                resultPerPage: Number(payload.resultPerPage) || 0,
                filteredProductsCount: Number(payload.filteredProductsCount) || 0,
                error: null
            };
        case ADMIN_PRODUCTS_SUCCESS:
            return {
                loading: false,
                products: Array.isArray(payload) ? payload : [],
                error: null
            };
        case SLIDER_PRODUCTS_SUCCESS:
            return {
                loading: false,
                products: Array.isArray(payload.products) ? payload.products : [],
                error: null
            };
        case ALL_PRODUCTS_FAIL:
        case ADMIN_PRODUCTS_FAIL:
        case SLIDER_PRODUCTS_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
                products: []
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
}

export const productDetailsReducer = (state = productDetailsInitialState, { type, payload }) => {
    switch (type) {
        case PRODUCT_DETAILS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };
        case PRODUCT_DETAILS_SUCCESS:
            return {
                loading: false,
                product: payload && typeof payload === 'object' ? payload : {},
                error: null
            };
        case PRODUCT_DETAILS_FAIL:
            return {
                ...state,
                loading: false,
                error: payload,
                product: {}
            };
        case REMOVE_PRODUCT_DETAILS:
            return {
                ...state,
                product: {},
                error: null
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
}

// Review Reducers
const reviewInitialState = {
    loading: false,
    success: false,
    error: null
};

export const newReviewReducer = (state = reviewInitialState, { type, payload }) => {
    switch (type) {
        case NEW_REVIEW_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };
        case NEW_REVIEW_SUCCESS:
            return {
                loading: false,
                success: Boolean(payload),
                error: null
            };
        case NEW_REVIEW_FAIL:
            return {
                ...state,
                loading: false,
                error: payload
            };
        case NEW_REVIEW_RESET:
            return {
                ...reviewInitialState
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
}

// Product Management Reducers
const productManagementInitialState = {
    loading: false,
    success: false,
    error: null,
    product: {}
};

export const newProductReducer = (state = productManagementInitialState, { type, payload }) => {
    switch (type) {
        case NEW_PRODUCT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };
        case NEW_PRODUCT_SUCCESS:
            return {
                loading: false,
                success: Boolean(payload?.success),
                product: payload?.product || {},
                error: null
            };
        case NEW_PRODUCT_FAIL:
            return {
                ...state,
                loading: false,
                error: payload
            };
        case NEW_PRODUCT_RESET:
            return productManagementInitialState;
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
}

// Product Update/Delete Reducer
const productUpdateDeleteInitialState = {
    loading: false,
    isUpdated: false,
    isDeleted: false,
    error: null
};

export const productReducer = (state = productUpdateDeleteInitialState, { type, payload }) => {
    switch (type) {
        case UPDATE_PRODUCT_REQUEST:
        case DELETE_PRODUCT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };
        case UPDATE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                isUpdated: Boolean(payload),
                error: null
            };
        case DELETE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                isDeleted: Boolean(payload),
                error: null
            };
        case UPDATE_PRODUCT_FAIL:
        case DELETE_PRODUCT_FAIL:
            return {
                ...state,
                loading: false,
                error: payload
            };
        case UPDATE_PRODUCT_RESET:
            return {
                ...state,
                isUpdated: false
            };
        case DELETE_PRODUCT_RESET:
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
}

// Product Reviews Reducer
const reviewsInitialState = {
    reviews: [],
    loading: false,
    error: null
};

export const productReviewsReducer = (state = reviewsInitialState, { type, payload }) => {
    switch (type) {
        case ALL_REVIEWS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };
        case ALL_REVIEWS_SUCCESS:
            return {
                loading: false,
                reviews: Array.isArray(payload) ? payload : [],
                error: null
            };
        case ALL_REVIEWS_FAIL:
            return {
                ...state,
                loading: false,
                error: payload
            };
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
}

// Single Review Management Reducer
const singleReviewInitialState = {
    loading: false,
    isDeleted: false,
    error: null
};

export const reviewReducer = (state = singleReviewInitialState, { type, payload }) => {
    switch (type) {
        case DELETE_REVIEW_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };
        case DELETE_REVIEW_SUCCESS:
            return {
                loading: false,
                isDeleted: Boolean(payload),
                error: null
            };
        case DELETE_REVIEW_FAIL:
            return {
                ...state,
                loading: false,
                error: payload
            };
        case DELETE_REVIEW_RESET:
            return singleReviewInitialState;
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
}