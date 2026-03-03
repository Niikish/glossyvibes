import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Import reducers based on the app's structure
import { productDetailsReducer, productsReducer } from '../reducers/productReducer';
import { userReducer, profileReducer, forgotPasswordReducer, allUsersReducer, userDetailsReducer } from '../reducers/userReducer';
import { cartReducer } from '../reducers/cartReducer';
import { saveForLaterReducer } from '../reducers/saveForLaterReducer';
import { newOrderReducer, myOrdersReducer, paymentStatusReducer, allOrdersReducer, orderReducer, orderDetailsReducer } from '../reducers/orderReducer';

const rootReducer = combineReducers({
    products: productsReducer,
    productDetails: productDetailsReducer,
    user: userReducer,
    profile: profileReducer,
    cart: cartReducer,
    saveForLater: saveForLaterReducer,
    newOrder: newOrderReducer,
    myOrders: myOrdersReducer,
    paymentStatus: paymentStatusReducer,
    orderDetails: orderDetailsReducer,
    forgotPassword: forgotPasswordReducer,
    allOrders: allOrdersReducer,
    order: orderReducer,
    allUsers: allUsersReducer,
    userDetails: userDetailsReducer,
});

function render(
    ui,
    {
        preloadedState,
        store = configureStore({ reducer: rootReducer, preloadedState }),
        ...renderOptions
    } = {}
) {
    function Wrapper({ children }) {
        return (
            <Provider store={store}>
                <BrowserRouter>{children}</BrowserRouter>
            </Provider>
        );
    }
    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { render };
