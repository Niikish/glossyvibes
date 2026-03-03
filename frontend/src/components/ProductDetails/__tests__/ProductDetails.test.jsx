import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import ProductDetails from '../ProductDetails';
import * as cartActions from '../../../actions/cartAction';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        id: 'test-product-id'
    }),
    useNavigate: () => jest.fn()
}));

const mockProduct = {
    _id: 'test-product-id',
    name: 'Test Product Name',
    images: [{ url: 'test-image.jpg' }],
    description: 'Test Description',
    price: 1000,
    cuttedPrice: 1500,
    ratings: 4.5,
    numOfReviews: 10,
    Stock: 10,
    warranty: 1,
    highlights: ['Highlight 1', 'Highlight 2'],
    specs: [{ title: 'Spec 1', description: 'Val 1' }],
    reviews: []
};

describe('ProductDetails Component', () => {

    let initialState;

    beforeEach(() => {
        initialState = {
            productDetails: {
                loading: false,
                product: mockProduct,
            },
            cart: {
                cartItems: []
            },
            user: {
                isAuthenticated: true,
                user: { _id: 'user1' }
            },
            saveForLater: {
                saveForLaterItems: []
            }
        };
    });

    it('1. Renders product details correctly', () => {
        render(<ProductDetails />, { preloadedState: initialState });

        expect(screen.getByText('Test Product Name')).toBeInTheDocument();
        expect(screen.getByText('₹1,000')).toBeInTheDocument(); // Format matching your utils if applicable. Might need adjust if commas differ
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('2. Shows Out of Stock when Stock is 0', () => {
        initialState.productDetails.product.Stock = 0;
        render(<ProductDetails />, { preloadedState: initialState });

        expect(screen.getByText(/Out Of Stock/i)).toBeInTheDocument();
    });

    it('3. Can add to cart', async () => {
        initialState.productDetails.product.Stock = 5;
        const addItemsToCartMock = jest.spyOn(cartActions, 'addItemsToCart').mockImplementation(() => (dispatch) => { });
        render(<ProductDetails />, { preloadedState: initialState });

        const addToCartBtn = screen.getByText(/ADD TO CART/i);
        fireEvent.click(addToCartBtn);

        await waitFor(() => {
            expect(addItemsToCartMock).toHaveBeenCalledWith('test-product-id');
        });

        addItemsToCartMock.mockRestore();
    });
});
