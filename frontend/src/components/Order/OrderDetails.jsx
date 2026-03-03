import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails, clearErrors } from '../../actions/orderAction';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import Loader from '../Layouts/Loader';
import TrackStepper from './TrackStepper';
import { formatDate } from '../../utils/functions';
import { generateInvoice } from '../../utils/invoiceGenerator';

const OrderDetails = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const params = useParams();
    const { order, error, loading } = useSelector((state) => state.orderDetails);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        dispatch(getOrderDetails(params.id));
    }, [dispatch, error, params.id, enqueueSnackbar]);

    // Calculate order summary
    const calculateSummary = () => {
        if (!order || !order.orderItems) return { subtotal: 0, shipping: 0, tax: 0, total: 0 };

        const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 0; // Free shipping
        const tax = order.totalPrice - subtotal - shipping;

        return { subtotal, shipping, tax, total: order.totalPrice };
    };

    const { subtotal, shipping, tax, total } = calculateSummary();

    return (
        <>
            <MetaData title="Order Details | GlossyVibes" />

            {loading ? <Loader /> : (
                <>
                    {order && order.user && (
                        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                            {/* Order Header */}
                            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-lg p-6 text-white">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div>
                                        <h1 className="text-2xl font-bold">Order Details</h1>
                                        <p className="text-white/80 mt-1">Order #{order._id}</p>
                                    </div>
                                    <div className="mt-4 sm:mt-0">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                                            ${order.orderStatus === "Delivered" ? "bg-green-100 text-green-800" :
                                                order.orderStatus === "Shipped" ? "bg-blue-100 text-blue-800" :
                                                    "bg-yellow-100 text-yellow-800"}`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Progress */}
                            <div className="bg-white p-6 border-b border-gray-200 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Order Progress</h2>
                                <TrackStepper activeStep={
                                    order.orderStatus === "Processing" ? 0 :
                                        order.orderStatus === "Shipped" ? 1 :
                                            order.orderStatus === "Delivered" ? 2 : 0
                                } />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                {/* Order Info */}
                                <div className="md:col-span-2 space-y-6">
                                    {/* Order Items */}
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div className="border-b border-gray-200 p-4 bg-gray-50">
                                            <h2 className="text-lg font-semibold flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Order Items
                                            </h2>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            {order.orderItems && order.orderItems.map((item) => (
                                                <div key={item._id} className="p-4 flex items-center">
                                                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <Link to={`/product/${item.product}`} className="text-purple-600 hover:text-pink-500 font-medium">
                                                            {item.name}
                                                        </Link>
                                                        <div className="mt-1 flex justify-between text-sm text-gray-600">
                                                            <p>Quantity: {item.quantity}</p>
                                                            <p>₹{item.price.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Shipping Info */}
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div className="border-b border-gray-200 p-4 bg-gray-50">
                                            <h2 className="text-lg font-semibold flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                Shipping Information
                                            </h2>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Shipping Address</h3>
                                                    <p className="mt-1 text-gray-800">
                                                        {order.shippingInfo.address}<br />
                                                        {order.shippingInfo.city}, {order.shippingInfo.state}<br />
                                                        {order.shippingInfo.pincode}<br />
                                                        {order.shippingInfo.country}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                                                    <p className="mt-1 text-gray-800">
                                                        {order.user.name}<br />
                                                        Phone: {order.shippingInfo.phoneNo}<br />
                                                        Email: {order.user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div className="border-b border-gray-200 p-4 bg-gray-50">
                                            <h2 className="text-lg font-semibold flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                                </svg>
                                                Payment Information
                                            </h2>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                                                    <p className="mt-1 text-gray-800">
                                                        {order.paymentInfo.id.toLowerCase().includes('cod')
                                                            ? 'Cash on Delivery'
                                                            : 'Online Payment'}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        ID: {order.paymentInfo.id}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                                                    <p className={`mt-1 ${order.paymentInfo.status === "succeeded" ? "text-green-600" : "text-yellow-600"} font-medium`}>
                                                        {order.paymentInfo.status}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        Paid on: {formatDate(order.paidAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="md:col-span-1">
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-20">
                                        <div className="border-b border-gray-200 p-4 bg-gray-50">
                                            <h2 className="text-lg font-semibold flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                                Order Summary
                                            </h2>
                                        </div>
                                        <div className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Subtotal:</span>
                                                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Shipping:</span>
                                                    <span className="font-medium">{shipping === 0 ? 'Free' : `₹{shipping.toLocaleString()}`}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Tax:</span>
                                                    <span className="font-medium">₹{tax.toLocaleString()}</span>
                                                </div>
                                                <div className="border-t border-gray-200 pt-3 mt-3">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold">Total:</span>
                                                        <span className="font-bold text-lg text-purple-600">₹{total.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 space-y-3">
                                                <div className="flex items-center text-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-gray-600">Order Placed:</span>
                                                    <span className="ml-auto font-medium">{formatDate(order.createdAt)}</span>
                                                </div>
                                                {order.shippedAt && (
                                                    <div className="flex items-center text-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2a1 1 0 00.9-.5l1.5-2A1 1 0 0015 7h-1V5a1 1 0 00-1-1H3zM14 7h-1V6h-1v1h-1v1h1v1h1V8h1V7z" />
                                                        </svg>
                                                        <span className="text-gray-600">Shipped On:</span>
                                                        <span className="ml-auto font-medium">{formatDate(order.shippedAt)}</span>
                                                    </div>
                                                )}
                                                {order.deliveredAt && (
                                                    <div className="flex items-center text-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                                                        </svg>
                                                        <span className="text-gray-600">Delivered On:</span>
                                                        <span className="ml-auto font-medium">{formatDate(order.deliveredAt)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6">
                                                <Link
                                                    to="/orders"
                                                    className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                                                >
                                                    Back to My Orders
                                                </Link>

                                                {/* Download Invoice Button */}
                                                <button
                                                    className="mt-3 block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                                                    onClick={() => {
                                                        if (order.invoiceUrl) {
                                                            window.open(order.invoiceUrl, '_blank');
                                                        } else {
                                                            generateInvoice(order);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                                        </svg>
                                                        {order.invoiceUrl ? "View GST Invoice" : "Download Invoice"}
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    )}
                </>
            )}
        </>
    );
};

export default OrderDetails;
