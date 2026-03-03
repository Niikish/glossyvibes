import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PercentIcon from '@mui/icons-material/Percent';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import TodayIcon from '@mui/icons-material/Today';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BackdropLoader from '../Layouts/BackdropLoader';
import MetaData from '../Layouts/MetaData';
import { getCouponDetails, updateCoupon, clearErrors } from '../../actions/couponAction';
import { UPDATE_COUPON_RESET } from '../../constants/couponConstants';

const UpdateCoupon = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { enqueueSnackbar } = useSnackbar();
    
    const { coupon, loading: detailsLoading, error: detailsError } = useSelector((state) => state.couponDetails);
    const { loading, isUpdated, error } = useSelector((state) => state.coupon);
    
    const [code, setCode] = useState('');
    const [type, setType] = useState('Percentage');
    const [value, setValue] = useState('');
    const [minPurchase, setMinPurchase] = useState('');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [validFrom, setValidFrom] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [usageLimit, setUsageLimit] = useState('');
    const [usageCount, setUsageCount] = useState(0);
    const [description, setDescription] = useState('');
    
    useEffect(() => {
        if (coupon && coupon._id !== id) {
            dispatch(getCouponDetails(id));
        } else {
            setCode(coupon.code || '');
            setType(coupon.type || 'Percentage');
            setValue(coupon.value || '');
            setMinPurchase(coupon.minPurchase || '');
            setMaxDiscount(coupon.maxDiscount || '');
            setValidFrom(coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '');
            setValidUntil(coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '');
            setIsActive(coupon.isActive !== undefined ? coupon.isActive : true);
            setUsageLimit(coupon.usageLimit || '');
            setUsageCount(coupon.usageCount || 0);
            setDescription(coupon.description || '');
        }
        
        if (detailsError) {
            enqueueSnackbar(detailsError, { variant: "error" });
            dispatch(clearErrors());
        }
        
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        
        if (isUpdated) {
            enqueueSnackbar("Coupon Updated Successfully", { variant: "success" });
            navigate("/admin/coupons");
            dispatch({ type: UPDATE_COUPON_RESET });
        }
        
    }, [dispatch, id, coupon, error, detailsError, isUpdated, navigate, enqueueSnackbar]);
    
    useEffect(() => {
        dispatch(getCouponDetails(id));
    }, [dispatch, id]);
    
    const updateCouponSubmitHandler = (e) => {
        e.preventDefault();
        
        // Validate form
        if (!code.trim()) {
            enqueueSnackbar("Please enter a coupon code", { variant: "error" });
            return;
        }
        
        if (!value || value <= 0) {
            enqueueSnackbar("Please enter a valid discount value", { variant: "error" });
            return;
        }
        
        if (type === 'Percentage' && (value < 1 || value > 99)) {
            enqueueSnackbar("Percentage discount must be between 1 and 99", { variant: "error" });
            return;
        }
        
        if (!minPurchase || minPurchase <= 0) {
            enqueueSnackbar("Please enter a valid minimum purchase amount", { variant: "error" });
            return;
        }
        
        if (type === 'Percentage' && (!maxDiscount || maxDiscount <= 0)) {
            enqueueSnackbar("Please enter a valid maximum discount amount", { variant: "error" });
            return;
        }
        
        if (!validFrom || !validUntil) {
            enqueueSnackbar("Please enter valid dates", { variant: "error" });
            return;
        }
        
        if (new Date(validFrom) > new Date(validUntil)) {
            enqueueSnackbar("End date cannot be before start date", { variant: "error" });
            return;
        }
        
        if (!usageLimit || usageLimit <= 0) {
            enqueueSnackbar("Please enter a valid usage limit", { variant: "error" });
            return;
        }
        
        const formData = {
            code: code.toUpperCase(),
            type,
            value: Number(value),
            minPurchase: Number(minPurchase),
            maxDiscount: type === 'Percentage' ? Number(maxDiscount) : Number(value),
            validFrom,
            validUntil,
            isActive,
            usageLimit: Number(usageLimit),
            description
        };
        
        dispatch(updateCoupon(id, formData));
    };
    
    return (
        <>
            <MetaData title="Admin: Update Coupon | Flipkart" />
            
            {(loading || detailsLoading) && <BackdropLoader />}
            
            <form onSubmit={updateCouponSubmitHandler} className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto my-4">
                <h1 className="text-2xl font-medium mb-6">Update Coupon</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coupon Code */}
                    <div className="md:col-span-2">
                        <TextField
                            label="Coupon Code"
                            variant="outlined"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            required
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocalOfferIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <FormHelperText>A unique code for customers to apply at checkout</FormHelperText>
                    </div>
                    
                    {/* Discount Type */}
                    <FormControl fullWidth>
                        <InputLabel>Discount Type</InputLabel>
                        <Select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            label="Discount Type"
                        >
                            <MenuItem value="Percentage">Percentage (%)</MenuItem>
                            <MenuItem value="Fixed">Fixed Amount (₹)</MenuItem>
                        </Select>
                        <FormHelperText>Type of discount to apply</FormHelperText>
                    </FormControl>
                    
                    {/* Discount Value */}
                    <TextField
                        label={type === 'Percentage' ? 'Discount Percentage' : 'Discount Amount'}
                        type="number"
                        variant="outlined"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    {type === 'Percentage' ? <PercentIcon /> : <CurrencyRupeeIcon />}
                                </InputAdornment>
                            )
                        }}
                        inputProps={{ 
                            min: 1,
                            max: type === 'Percentage' ? 99 : undefined
                        }}
                        required
                        fullWidth
                    />
                    
                    {/* Minimum Purchase */}
                    <TextField
                        label="Minimum Purchase"
                        type="number"
                        variant="outlined"
                        value={minPurchase}
                        onChange={(e) => setMinPurchase(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CurrencyRupeeIcon />
                                </InputAdornment>
                            )
                        }}
                        inputProps={{ min: 0 }}
                        required
                        fullWidth
                    />
                    
                    {/* Maximum Discount (for percentage) */}
                    {type === 'Percentage' && (
                        <TextField
                            label="Maximum Discount"
                            type="number"
                            variant="outlined"
                            value={maxDiscount}
                            onChange={(e) => setMaxDiscount(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CurrencyRupeeIcon />
                                    </InputAdornment>
                                )
                            }}
                            inputProps={{ min: 0 }}
                            required
                            fullWidth
                        />
                    )}
                    
                    {/* Valid From */}
                    <TextField
                        label="Valid From"
                        type="date"
                        variant="outlined"
                        value={validFrom}
                        onChange={(e) => setValidFrom(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <TodayIcon />
                                </InputAdornment>
                            )
                        }}
                        required
                        fullWidth
                    />
                    
                    {/* Valid Until */}
                    <TextField
                        label="Valid Until"
                        type="date"
                        variant="outlined"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <TodayIcon />
                                </InputAdornment>
                            )
                        }}
                        required
                        fullWidth
                    />
                    
                    {/* Usage Limit */}
                    <TextField
                        label="Usage Limit"
                        type="number"
                        variant="outlined"
                        value={usageLimit}
                        onChange={(e) => setUsageLimit(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <ShoppingBagIcon />
                                </InputAdornment>
                            )
                        }}
                        inputProps={{ min: usageCount }}
                        helperText={`Current usage: ${usageCount}`}
                        required
                        fullWidth
                    />
                    
                    {/* Active Status */}
                    <div className="flex items-center space-x-2">
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Active"
                        />
                        <FormHelperText>Enable or disable this coupon</FormHelperText>
                    </div>
                    
                    {/* Description */}
                    <div className="md:col-span-2">
                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                            variant="outlined"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add description for this coupon (optional)"
                            fullWidth
                        />
                    </div>
                </div>
                
                <div className="flex justify-end mt-8 space-x-3">
                    <Button 
                        onClick={() => navigate('/admin/coupons')}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Update Coupon
                    </Button>
                </div>
            </form>
        </>
    );
};

export default UpdateCoupon; 