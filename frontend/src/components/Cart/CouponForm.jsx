import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InputAdornment from '@mui/material/InputAdornment';
import { applyCoupon, removeCoupon, clearErrors } from '../../actions/couponAction';
import { APPLY_COUPON_RESET } from '../../constants/couponConstants';

const CouponForm = ({ cartTotal }) => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const [code, setCode] = useState('');
    const [appliedCode, setAppliedCode] = useState('');

    const { loading, success, error, discount } = useSelector((state) => state.appliedCoupon);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }

        if (success) {
            setAppliedCode(discount.code);
            setCode('');
            enqueueSnackbar(`Coupon ${discount.code} applied successfully! You saved ₹{discount.discountAmount}`, { variant: "success" });
            dispatch({ type: APPLY_COUPON_RESET });

            // Save to localStorage
            localStorage.setItem('appliedCoupon', JSON.stringify(discount));
        }
    }, [dispatch, error, success, discount, enqueueSnackbar]);

    // Check if there's a saved coupon in localStorage on component mount
    useEffect(() => {
        const savedCoupon = localStorage.getItem('appliedCoupon');
        if (savedCoupon) {
            const parsedCoupon = JSON.parse(savedCoupon);
            if (parsedCoupon.code) {
                setAppliedCode(parsedCoupon.code);
            }
        }
    }, []);

    const handleApplyCoupon = () => {
        if (!code.trim()) {
            enqueueSnackbar("Please enter a coupon code", { variant: "error" });
            return;
        }

        dispatch(applyCoupon(code, cartTotal));
    };

    const handleRemoveCoupon = () => {
        dispatch(removeCoupon());
        setAppliedCode('');
        setCode('');
        localStorage.removeItem('appliedCoupon');
        enqueueSnackbar("Coupon removed", { variant: "success" });
    };

    return (
        <div className="mt-4 border p-4 rounded-md">
            <h4 className="text-lg font-medium mb-2">Apply Coupon</h4>

            {appliedCode ? (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-green-50 p-3 rounded-md">
                        <LocalOfferIcon className="text-green-600" />
                        <div className="flex-grow">
                            <p className="font-medium text-green-700">
                                Coupon <span className="font-bold">{appliedCode}</span> applied!
                            </p>
                            {discount && discount.discountAmount && (
                                <p className="text-sm text-green-600">You saved ₹{discount.discountAmount}</p>
                            )}
                        </div>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleRemoveCoupon}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2">
                    <TextField
                        placeholder="Enter coupon code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        size="small"
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LocalOfferIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleApplyCoupon}
                        disabled={loading}
                    >
                        Apply
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CouponForm; 