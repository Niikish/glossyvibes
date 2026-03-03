import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import Cart from '../Cart';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn()
}));

const mockCartItem = {
    product: 'test-product-id',
    name: 'Test Cart Product',
    price: 1500,
    cuttedPrice: 2000,
    image: 'test-image.jpg',
    stock: 5,
    quantity: 1
};

describe('Cart Component', () => {

    let initialState;

    beforeEach(() => {
        initialState = {
            cart: {
                cartItems: []
            },
            saveForLater: {
                saveForLaterItems: []
            }
        };
    });

    it('1. Renders Empty Cart when no items', () => {
        render(<Cart />, { preloadedState: initialState });
        // The word "Empty" appears in EmptyCart component typically
        expect(screen.getByText(/Empty/i)).toBeInTheDocument();
        const placeOrderBtn = screen.getByText(/PLACE ORDER/i);
        expect(placeOrderBtn).toBeDisabled();
    });

    it('2. Renders cart items correctly', () => {
        initialState.cart.cartItems = [mockCartItem];
        render(<Cart />, { preloadedState: initialState });

        expect(screen.getByText('Test Cart Product')).toBeInTheDocument();
        expect(screen.getByText('₹1,500')).toBeInTheDocument(); // Formatted price

        const placeOrderBtn = screen.getByText(/PLACE ORDER/i);
        expect(placeOrderBtn).not.toBeDisabled();
    });

    it('3. Can navigate to checkout when clicking Place Order', () => {
        const navigateMock = jest.fn();
        jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

        initialState.cart.cartItems = [mockCartItem];
        render(<Cart />, { preloadedState: initialState });

        const placeOrderBtn = screen.getByText(/PLACE ORDER/i);
        fireEvent.click(placeOrderBtn);

        expect(navigateMock).toHaveBeenCalledWith('/login?redirect=shipping');
    });
});
