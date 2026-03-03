import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';
import { clearErrors as clearOrderErrors, newOrder, resetNewOrder } from '../../actions/orderAction';
import { createRazorpayOrder, verifyRazorpayPayment, clearErrors as clearPaymentErrors } from '../../actions/paymentAction';
import { useSnackbar } from 'notistack';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import MetaData from '../Layouts/MetaData';
import { useNavigate } from 'react-router-dom';
import { emptyCart } from '../../actions/cartAction';

const loadRazorpayCore = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [payDisable, setPayDisable] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [razorpayOpened, setRazorpayOpened] = useState(false);

    // Reset new order state when we leave this page (prevents stale error on revisit)
    useEffect(() => {
        dispatch(resetNewOrder());
        return () => { dispatch(resetNewOrder()); };
    }, [dispatch]);

    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const { error: orderError } = useSelector((state) => state.newOrder);
    const { discount, appliedCoupon } = useSelector((state) => state.coupons);
    const { loading: paymentLoading, error: paymentError, orderData } = useSelector((state) => state.payment);

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discount || 0;
    const codCharges = paymentMethod === 'cod' && subtotal <= 500 ? 79 : 0;
    const totalPrice = subtotal + codCharges - discountAmount;

    const submitHandler = async (e) => {
        e.preventDefault();
        setPayDisable(true);

        try {
            const orderDataObj = {
                shippingInfo,
                orderItems: cartItems,
                totalPrice,
            };

            if (appliedCoupon) {
                orderDataObj.couponCode = appliedCoupon;
                orderDataObj.couponDiscount = discount;
            }

            if (paymentMethod === 'cod') {
                orderDataObj.paymentInfo = {
                    status: "COD",
                    id: "cod_" + Date.now()
                };

                const result = await dispatch(newOrder(orderDataObj));

                if (result?.success) {
                    // Order created successfully — now clean up and redirect
                    const { markCouponUsed, removeCoupon } = require('../../redux/couponSlice');
                    if (appliedCoupon) {
                        try {
                            await dispatch(markCouponUsed({ code: appliedCoupon, orderId: result.order._id }));
                            dispatch(removeCoupon());
                        } catch (error) {
                            console.error('Error marking coupon as used:', error);
                        }
                    }

                    dispatch(emptyCart());
                    navigate('/orders/success');
                } else {
                    // Order failed — stay on page, show error
                    const errMsg = result?.error || "Failed to place order. Please try again.";
                    enqueueSnackbar(errMsg, { variant: "error" });
                    setPayDisable(false);
                }
            } else {
                // Razorpay Payment
                const isLoaded = await loadRazorpayCore();
                if (!isLoaded) {
                    enqueueSnackbar("Razorpay SDK failed to load. Are you online?", { variant: "error" });
                    setPayDisable(false);
                    return;
                }

                // FRESH ORDER ON EVERY CLICK
                setRazorpayOpened(false);
                dispatch(createRazorpayOrder(orderDataObj));
            }
        } catch (error) {
            setPayDisable(false);
            enqueueSnackbar("Payment Initialization Failed", { variant: "error" });
        }
    };

    // Watch for Razorpay Order Creation Success
    useEffect(() => {
        if (orderData && orderData.success && !razorpayOpened) {
            setRazorpayOpened(true);

            const isMobile = /iPhone|Android|iPad|iPod/i.test(navigator.userAgent);

            // Reconstruct orderData for the verify call
            const currentOrderData = {
                shippingInfo,
                orderItems: cartItems,
                totalPrice,
                couponCode: discount?.code,
                couponDiscount: discount?.discount || 0
            };

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "GlossyVibes",
                description: "Payment for your order",
                order_id: orderData.razorpayOrderId,
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay using UPI",
                                instruments: [{ method: "upi" }]
                            },
                            other: {
                                name: "Other Payment Methods",
                                instruments: [
                                    { method: "card" },
                                    { method: "netbanking" },
                                    { method: "wallet" }
                                ]
                            }
                        },
                        sequence: ["block.upi", "block.other"],
                        preferences: { show_default_blocks: true }
                    }
                },
                handler: async function (response) {
                    const data = await dispatch(verifyRazorpayPayment({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        orderData: currentOrderData // Pass full order data for server-side creation
                    }));

                    if (data && data.success) {
                        const { markCouponUsed, removeCoupon } = require('../../redux/couponSlice');
                        if (appliedCoupon) {
                            dispatch(markCouponUsed({ code: appliedCoupon, orderId: data.order._id }));
                            dispatch(removeCoupon());
                        }
                        dispatch(emptyCart());
                        enqueueSnackbar(data.message || "Payment Successful", { variant: "success" });
                        navigate('/orders/success');
                    } else if (data && !data.success) {
                        enqueueSnackbar(data.message || "Payment verification failed", { variant: "error" });
                        setPayDisable(false);
                        setRazorpayOpened(false);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: shippingInfo.phoneNo,
                },
                theme: { color: "#2874f0" },
                modal: {
                    ondismiss: function () {
                        setPayDisable(false);
                        setRazorpayOpened(false);
                        dispatch(clearPaymentErrors());
                    }
                }
            };



            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                enqueueSnackbar(response.error.description || "Payment Failed", { variant: "error" });
                setPayDisable(false);
                setRazorpayOpened(false);
            });
            rzp1.open();
        }
    }, [orderData, razorpayOpened, dispatch, enqueueSnackbar, user, shippingInfo, cartItems, totalPrice, discount]);

    // Error Handling useEffect Isolation (Crucial for infinite loop prevention)
    useEffect(() => {
        if (orderError) {
            setPayDisable(false);
            enqueueSnackbar(orderError, { variant: "error" });
            dispatch(clearOrderErrors());
        }
        if (paymentError) {
            setPayDisable(false);
            enqueueSnackbar(paymentError, { variant: "error" });
            dispatch(clearPaymentErrors());
            setRazorpayOpened(false);
        }
    }, [dispatch, orderError, paymentError, enqueueSnackbar]);

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    return (
        <>
            <MetaData title="GlossyVibes: Secure Payment | Razorpay & COD" />

            <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-4">
                <div className="flex flex-col lg:flex-row gap-4 mb-7">

                    <div className="flex-1">
                        <Stepper activeStep={3}>
                            <div className="w-full bg-white">
                                <form onSubmit={(e) => submitHandler(e)} autoComplete="off" className="flex flex-col justify-start gap-4 w-full px-4 sm:px-8 my-4 overflow-hidden">

                                    <FormControl>
                                        <RadioGroup
                                            aria-labelledby="payment-radio-group"
                                            value={paymentMethod}
                                            onChange={handlePaymentMethodChange}
                                            name="payment-radio-button"
                                        >
                                            <FormControlLabel
                                                value="razorpay"
                                                control={<Radio />}
                                                label={
                                                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                                                        <img draggable="false" className="h-5 sm:h-6 object-contain" src="https://razorpay.com/build/browser/static/razorpay-logo.5cdb58df.svg" alt="Razorpay Logo" />
                                                        <span className="font-medium text-gray-800 text-sm sm:text-base">Cards, UPI, NetBanking, Wallets</span>
                                                    </div>
                                                }
                                            />

                                            <FormControlLabel
                                                value="cod"
                                                control={<Radio />}
                                                label={
                                                    <div className="flex items-center gap-4">
                                                        <img draggable="false" className="h-6 w-6 object-contain" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSIjMjg3NEYwIiBkPSJNMTEgMThoLTF2LTFoMXYxem0tMi0xSDh2MWgxdi0xem0tMiAxSDZ2MWgxdi0xem0tMi0xSDN2M2gxdi0zem0xMiAyaC0xdjFoMXYtMXptLTItMWgtMXYxaDF2LTF6bS0yIDFoLTF2MWgxdi0xem0tMi0xaC0xdjFoMXYtMXptOC00aC0xdjFoMXYtMXptLTItMWgtMXYxaDF2LTF6bS0yIDFoLTF2MWgxdi0xem0tMi0xaC0xdjFoMXYtMXptOC00aC0xdjFoMXYtMXptLTItMWgtMXYxaDF2LTF6bS0yIDFoLTF2MWgxdi0xem0tMi0xaC0xdjFoMXYtMXoiLz48cGF0aCBmaWxsPSIjMjg3NEYwIiBkPSJNMjAgM0g0Yy0xLjEgMC0yIC45LTIgMnYxMmMwIDEuMS45IDIgMiAyaDE2YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6bTAgMTRINFY1aDE2djEyeiIvPjwvc3ZnPg==" alt="COD Icon" />
                                                        <span className="font-medium text-gray-800">Cash on Delivery</span>
                                                    </div>
                                                }
                                            />
                                        </RadioGroup>
                                    </FormControl>

                                    {paymentMethod === 'cod' && (
                                        <div className="text-sm text-gray-500 mt-2 mb-4">
                                            <p>• Pay in cash when your order is delivered</p>
                                            <p>• Available for orders up to ₹50,000</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={payDisable || paymentLoading}
                                        className={`${(payDisable || paymentLoading) ? "bg-primary-grey cursor-not-allowed" : "bg-primary-orange shadow hover:shadow-lg active:scale-95"} w-full sm:w-1/3 my-2 py-3.5 text-sm font-medium text-white rounded-sm uppercase sticky bottom-0 sm:static transition-all duration-300`}
                                    >
                                        {paymentLoading ? "Processing..." : paymentMethod === 'cod' ? 'Place Order' : `Pay ₹{totalPrice.toLocaleString()}`}
                                    </button>


                                </form>
                            </div>
                        </Stepper>
                    </div>

                    <PriceSidebar cartItems={cartItems} paymentMethod={paymentMethod} />
                </div>
            </main>
        </>
    );
};

export default Payment;