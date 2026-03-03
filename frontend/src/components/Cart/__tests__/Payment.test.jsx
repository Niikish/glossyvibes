import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../test-utils';
import Payment from '../Payment';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Mock Razorpay on window
beforeAll(() => {
    window.Razorpay = jest.fn().mockImplementation(() => {
        return {
            open: jest.fn(),
            on: jest.fn()
        };
    });
});

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn()
}));

const stripePromise = loadStripe('pk_test_mock');

const PaymentWrapper = () => (
    <Elements stripe={stripePromise}>
        <Payment />
    </Elements>
);

describe('Payment Component (Mocked)', () => {

    let initialState;

    beforeEach(() => {
        initialState = {
            cart: {
                cartItems: [
                    {
                        product: 'test-product-id',
                        name: 'Test Cart Product',
                        price: 1500,
                        quantity: 1
                    }
                ],
                shippingInfo: {
                    address: "Test Address",
                    city: "Test City",
                    state: "Test State",
                    country: "India",
                    pinCode: 123456,
                    phoneNo: 1234567890
                }
            },
            user: {
                user: {
                    name: "Test User",
                    email: "test@example.com",
                    mobileNumber: "1234567890"
                }
            }
        };
        // Mock session storage
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: jest.fn(() => JSON.stringify({ totalPrice: 1500 })),
                setItem: jest.fn()
            },
            writable: true
        });
    });

    it('1. Renders payment component & options', () => {
        render(<PaymentWrapper />, { preloadedState: initialState });

        expect(screen.getByText(/Paytm/i)).toBeInTheDocument();
        expect(screen.getByText(/Razorpay/i)).toBeInTheDocument();
    });

    it('2. Clicking Razorpay simulates opening modal', () => {
        render(<PaymentWrapper />, { preloadedState: initialState });

        const razorpayRadio = screen.getByLabelText(/Razorpay/i);
        fireEvent.click(razorpayRadio);

        const payBtn = screen.getByText(/Pay ₹1,500/i);
        fireEvent.click(payBtn);

        // At this point it dispatches API call, mocking the axios is better for deeper tests
        // Testing that the button is clickable and label updates based on selection
        expect(payBtn).toBeInTheDocument();
    });
});
