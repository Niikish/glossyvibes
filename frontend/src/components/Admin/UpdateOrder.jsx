import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { clearErrors, getOrderDetails, updateOrder } from '../../actions/orderAction';
import { UPDATE_ORDER_RESET } from '../../constants/orderConstants';
import { formatDate } from '../../utils/functions';
import TrackStepper from '../Order/TrackStepper';
import Loading from './Loading';
import { Link } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MetaData from '../Layouts/MetaData';
import axios from '../../utils/axiosConfig';

// Allowed next status based on current order status (mirrors backend STATUS_FLOW)
const NEXT_STATUS = {
    Processing: ['Shipped'],
    Shipped: ['Delivered'],
    Delivered: [],
};

const UpdateOrder = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const params = useParams();

    const [status, setStatus] = useState('');

    const { order, error, loading } = useSelector((state) => state.orderDetails);
    const { isUpdated, error: updateError } = useSelector((state) => state.order);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: 'error' });
            dispatch(clearErrors());
        }
        if (updateError) {
            enqueueSnackbar(updateError, { variant: 'error' });
            dispatch(clearErrors());
        }
        // FE-009 FIX: corrected typo "Order Updates" → "Order Updated Successfully"
        if (isUpdated) {
            enqueueSnackbar('Order Updated Successfully', { variant: 'success' });
            dispatch({ type: UPDATE_ORDER_RESET });
        }
        dispatch(getOrderDetails(params.id));
    }, [dispatch, error, params.id, isUpdated, updateError, enqueueSnackbar]);

    const updateOrderSubmitHandler = (e) => {
        e.preventDefault();
        if (!status) {
            enqueueSnackbar('Please select a status to update', { variant: 'warning' });
            return;
        }
        const formData = new FormData();
        formData.set('status', status);
        dispatch(updateOrder(params.id, formData));
    };

    const handleRefund = async () => {
        if (window.confirm("Are you sure you want to process a full refund via Razorpay? This cannot be undone.")) {
            try {
                const { data } = await axios.post(`/api/v1/admin/payments/refund/${order._id}`);
                enqueueSnackbar(data.message || "Refund Processed Successfully", { variant: 'success' });
                dispatch(getOrderDetails(params.id)); // refresh order state
            } catch (error) {
                enqueueSnackbar(error.response?.data?.message || "Refund failed", { variant: 'error' });
            }
        }
    };

    const currentStatus = order?.orderStatus;
    const allowedNext = currentStatus ? (NEXT_STATUS[currentStatus] || []) : [];
    const isDelivered = currentStatus === 'Delivered';

    return (
        <>
            <MetaData title="Admin: Update Order | GlossyVibes" />

            {loading ? <Loading /> : (
                <>
                    {order && order.user && order.shippingInfo && (
                        <div className="flex flex-col gap-4">
                            <Link to="/admin/orders" className="ml-1 flex items-center gap-0 font-medium text-primary-blue uppercase">
                                <ArrowBackIosIcon sx={{ fontSize: '18px' }} />Go Back
                            </Link>

                            <div className="flex flex-col sm:flex-row bg-white shadow-lg rounded-lg min-w-full">
                                {/* Delivery Address */}
                                <div className="sm:w-1/2 border-r">
                                    <div className="flex flex-col gap-3 my-8 mx-10">
                                        <h3 className="font-medium text-lg">Delivery Address</h3>
                                        <h4 className="font-medium">{order.user.name}</h4>
                                        <p className="text-sm">{`${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state} - ${order.shippingInfo.pincode}`}</p>
                                        <div className="flex gap-2 text-sm">
                                            <p className="font-medium">Email</p>
                                            <p>{order.user.email}</p>
                                        </div>
                                        <div className="flex gap-2 text-sm">
                                            <p className="font-medium">Phone Number</p>
                                            <p>{order.shippingInfo.phoneNo}</p>
                                        </div>
                                    </div>

                                    {/* Razorpay Payment Details Box */}
                                    <div className="flex flex-col gap-3 my-8 mx-10 border-t pt-6">
                                        <h3 className="font-medium text-lg">Payment Details</h3>
                                        <div className="flex gap-2 text-sm">
                                            <p className="font-medium">Method:</p>
                                            <p>{order.paymentMethod}</p>
                                        </div>
                                        <div className="flex gap-2 text-sm">
                                            <p className="font-medium">Status:</p>
                                            <p className={`font-semibold ${order.paymentStatus === 'Paid' ? 'text-green-600' : order.paymentStatus === 'Refunded' ? 'text-blue-600' : 'text-red-600'}`}>
                                                {order.paymentStatus || (order.paymentInfo?.status === 'SUCCESS' ? 'Paid' : 'Pending')}
                                            </p>
                                        </div>

                                        {Object.keys(order.paymentDetails || {}).length > 0 && (
                                            <div className="bg-gray-50 p-3 rounded-lg text-xs break-all mt-2 space-y-2">
                                                {order.paymentDetails.razorpayOrderId && (
                                                    <p><span className="font-medium">RZP Order ID:</span> {order.paymentDetails.razorpayOrderId}</p>
                                                )}
                                                {order.paymentDetails.razorpayPaymentId && (
                                                    <p><span className="font-medium">RZP Payment ID:</span> {order.paymentDetails.razorpayPaymentId}</p>
                                                )}
                                                {order.paymentDetails.razorpayRefundId && (
                                                    <p><span className="font-medium text-blue-600">RZP Refund ID:</span> {order.paymentDetails.razorpayRefundId}</p>
                                                )}
                                            </div>
                                        )}

                                        {order.paymentMethod === 'Razorpay' && order.paymentStatus === 'Paid' && (
                                            <button
                                                type="button"
                                                onClick={handleRefund}
                                                className="mt-4 bg-gray-800 hover:bg-black text-white px-4 py-2 rounded text-sm w-max transition-colors"
                                            >
                                                Process Razorpay Refund
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Update Status / Read-only section */}
                                <div className="flex flex-col gap-3 p-8 sm:w-1/2">
                                    <h3 className="font-medium text-lg">Update Status</h3>
                                    <div className="flex gap-2">
                                        <p className="text-sm font-medium">Current Status:</p>
                                        <p className="text-sm">
                                            {currentStatus === 'Shipped' && `Shipped on ${formatDate(order.shippedAt)}`}
                                            {currentStatus === 'Processing' && `Ordered on ${formatDate(order.createdAt)}`}
                                            {currentStatus === 'Delivered' && `Delivered on ${formatDate(order.deliveredAt)}`}
                                        </p>
                                    </div>

                                    {/* FE-010 FIX: when Delivered, show read-only badge instead of update form */}
                                    {isDelivered ? (
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full">
                                                ✓ Order Delivered — No further updates possible
                                            </span>
                                        </div>
                                    ) : (
                                        <form onSubmit={updateOrderSubmitHandler} className="flex flex-col gap-3">
                                            <FormControl fullWidth sx={{ marginTop: 1 }}>
                                                <InputLabel id="order-status-select-label">Next Status</InputLabel>
                                                <Select
                                                    labelId="order-status-select-label"
                                                    id="order-status-select"
                                                    value={status}
                                                    label="Next Status"
                                                    onChange={(e) => setStatus(e.target.value)}
                                                >
                                                    <MenuItem value="">
                                                        <em>Select Next Status</em>
                                                    </MenuItem>
                                                    {allowedNext.map((s) => (
                                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <button
                                                type="submit"
                                                disabled={!status}
                                                className="bg-primary-orange p-2.5 text-white font-medium rounded shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Update
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Order items */}
                            {order.orderItems && order.orderItems.map((item) => {
                                const { _id, image, name, price, quantity } = item;
                                return (
                                    <div className="flex flex-col sm:flex-row min-w-full shadow-lg rounded-lg bg-white px-2 py-5" key={_id}>
                                        <div className="flex flex-col sm:flex-row sm:w-1/2 gap-1">
                                            <div className="w-full sm:w-32 h-24">
                                                <img draggable="false" className="h-full w-full object-contain" src={image} alt={name} />
                                            </div>
                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                <p className="text-sm">{name.length > 45 ? `${name.substring(0, 45)}...` : name}</p>
                                                <p className="text-xs text-gray-600 mt-2">Quantity: {quantity}</p>
                                                <p className="text-xs text-gray-600">Price: ₹{price.toLocaleString()}</p>
                                                <span className="font-medium">Total: ₹{(quantity * price).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-full sm:w-1/2">
                                            <h3 className="font-medium sm:text-center">Order Status</h3>
                                            <TrackStepper
                                                orderOn={order.createdAt}
                                                shippedAt={order.shippedAt}
                                                deliveredAt={order.deliveredAt}
                                                activeStep={
                                                    order.orderStatus === 'Delivered' ? 2 :
                                                        order.orderStatus === 'Shipped' ? 1 : 0
                                                }
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default UpdateOrder;
