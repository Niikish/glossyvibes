import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateCoupon, removeCoupon, clearCouponError } from '../../redux/couponSlice';
import { useSnackbar } from 'notistack';

const CouponInput = ({ cartTotal }) => {
    const [couponCode, setCouponCode] = useState('');
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { appliedCoupon, discount, loading, error, success } = useSelector((state) => state.coupons);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearCouponError());
        }
        if (success && appliedCoupon) {
            enqueueSnackbar(`₹{discount} discount applied!`, { variant: "success" });
        }
    }, [error, success, appliedCoupon, discount, dispatch, enqueueSnackbar]);

    const handleApply = (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        dispatch(validateCoupon({ code: couponCode, cartTotal }));
    };

    const handleRemove = () => {
        dispatch(removeCoupon());
        setCouponCode('');
        enqueueSnackbar("Coupon removed", { variant: "info" });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                Apply Coupon
            </h4>

            {appliedCoupon ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-green-800">{appliedCoupon}</p>
                            <p className="text-xs text-green-600">₹{discount} discount applied</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <form onSubmit={handleApply} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono tracking-wider"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !couponCode.trim()}
                        className={`px-6 py-3 bg-black text-white rounded-xl font-bold transition-all ₹{loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 active:scale-95'}`}
                    >
                        {loading ? '...' : 'APPLY'}
                    </button>
                </form>
            )}

            <p className="text-[11px] text-gray-500 mt-3 italic">
                * Only one coupon can be applied per order
            </p>
        </div>
    );
};

export default CouponInput;
