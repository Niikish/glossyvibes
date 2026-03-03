import { configureStore } from '@reduxjs/toolkit';
import { forgotPasswordReducer, profileReducer, userReducer, allUsersReducer, userDetailsReducer } from './reducers/userReducer';
import { newProductReducer, newReviewReducer, productDetailsReducer, productReducer, productsReducer, productReviewsReducer, reviewReducer } from './reducers/productReducer';
import { cartReducer } from './reducers/cartReducer';
import { saveForLaterReducer } from './reducers/saveForLaterReducer';
import { allOrdersReducer, myOrdersReducer, newOrderReducer, orderDetailsReducer, orderReducer, paymentStatusReducer } from './reducers/orderReducer';
import { wishlistReducer } from './reducers/wishlistReducer';
import { brandsReducer, featuredBrandsReducer, newBrandReducer, brandReducer } from './reducers/brandReducer';
import {
    categoriesReducer,
    categoryDetailsReducer,
    categoryReducer,
    mainCategoriesReducer,
    newCategoryReducer,
    subCategoriesReducer
} from './reducers/categoryReducer';
import { adminStatsReducer, paymentAnalyticsReducer, settlementsReducer } from './reducers/adminReducer';
import { paymentReducer } from './reducers/paymentReducer';
import couponsReducer from './redux/couponSlice';

const reducer = {
    user: userReducer,
    profile: profileReducer,
    forgotPassword: forgotPasswordReducer,
    products: productsReducer,
    productDetails: productDetailsReducer,
    newReview: newReviewReducer,
    cart: cartReducer,
    saveForLater: saveForLaterReducer,
    newOrder: newOrderReducer,
    myOrders: myOrdersReducer,
    paymentStatus: paymentStatusReducer,
    orderDetails: orderDetailsReducer,
    allOrders: allOrdersReducer,
    order: orderReducer,
    newProduct: newProductReducer,
    product: productReducer,
    users: allUsersReducer,
    userDetails: userDetailsReducer,
    reviews: productReviewsReducer,
    review: reviewReducer,
    wishlist: wishlistReducer,
    brands: brandsReducer,
    featuredBrands: featuredBrandsReducer,
    newBrand: newBrandReducer,
    brand: brandReducer,
    categories: categoriesReducer,
    mainCategories: mainCategoriesReducer,
    subCategories: subCategoriesReducer,
    categoryDetails: categoryDetailsReducer,
    newCategory: newCategoryReducer,
    category: categoryReducer,
    coupons: couponsReducer,
    adminStats: adminStatsReducer, // Added admin stats reducer
    paymentAnalytics: paymentAnalyticsReducer,
    settlements: settlementsReducer,
    payment: paymentReducer,
};

let initialState = {
    cart: {
        cartItems: localStorage.getItem('cartItems')
            ? JSON.parse(localStorage.getItem('cartItems'))
            : [],
        shippingInfo: localStorage.getItem("shippingInfo")
            ? JSON.parse(localStorage.getItem("shippingInfo"))
            : {},
    },
    saveForLater: {
        saveForLaterItems: localStorage.getItem('saveForLaterItems')
            ? JSON.parse(localStorage.getItem('saveForLaterItems'))
            : [],
    },
    wishlist: {
        wishlistItems: localStorage.getItem('wishlistItems')
            ? JSON.parse(localStorage.getItem('wishlistItems'))
            : [],
    },
};

const store = configureStore({
    reducer,
    preloadedState: initialState,
    // Thunk is included by default in RTK
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false, // Disable serializable check to avoid issues with date objects etc.
    }),
});

export default store;