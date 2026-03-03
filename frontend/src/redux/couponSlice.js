import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Mark coupon as used
export const markCouponUsed = createAsyncThunk(
    'coupons/markUsed',
    async ({ code, orderId }, { rejectWithValue }) => {
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            };
            const { data } = await axios.patch('/api/coupons/mark-used', { code: code.toUpperCase(), orderId }, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to mark coupon as used');
        }
    }
);

// Validates coupon against cart total
export const validateCoupon = createAsyncThunk(
    'coupons/validate',
    async ({ code, cartTotal }, { rejectWithValue }) => {
        try {
            const config = {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            };
            const { data } = await axios.post('/api/coupons/validate', { code: code.toUpperCase(), cartTotal }, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Validation failed');
        }
    }
);

// Fetches all user coupons
export const getMyCoupons = createAsyncThunk(
    'coupons/myCoupons',
    async (_, { rejectWithValue }) => {
        try {
            const config = { withCredentials: true };
            const { data } = await axios.get('/api/coupons/my-coupons', config);
            return data.coupons;
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to fetch coupons');
        }
    }
);

const couponSlice = createSlice({
    name: 'coupons',
    initialState: {
        appliedCoupon: localStorage.getItem('appliedCoupon')
            ? JSON.parse(localStorage.getItem('appliedCoupon'))
            : null,
        discount: localStorage.getItem('appliedCouponDiscount')
            ? Number(localStorage.getItem('appliedCouponDiscount'))
            : 0,
        myCoupons: [],
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        removeCoupon: (state) => {
            state.appliedCoupon = null;
            state.discount = 0;
            state.error = null;
            localStorage.removeItem('appliedCoupon');
            localStorage.removeItem('appliedCouponDiscount');
        },
        clearCouponError: (state) => {
            state.error = null;
        },
        clearCouponSuccess: (state) => {
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Validate Coupon
            .addCase(validateCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.appliedCoupon = action.meta.arg.code.toUpperCase();
                state.discount = action.payload.discountAmount;
                state.success = true;
                localStorage.setItem('appliedCoupon', JSON.stringify(state.appliedCoupon));
                localStorage.setItem('appliedCouponDiscount', JSON.stringify(state.discount));
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.appliedCoupon = null;
                state.discount = 0;
            })
            // Get My Coupons
            .addCase(getMyCoupons.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMyCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.myCoupons = action.payload;
            })
            .addCase(getMyCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { removeCoupon, clearCouponError, clearCouponSuccess } = couponSlice.actions;
export default couponSlice.reducer;
