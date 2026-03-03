const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');

// Valid order status transitions — prevents skipping steps
const STATUS_FLOW = {
    Processing: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered', 'Cancelled'],
    Delivered: [],
    Cancelled: [],
};

// Create New Order
exports.newOrder = asyncErrorHandler(async (req, res, next) => {

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
        couponCode,
        couponDiscount,
    } = req.body;

    // Guard for missing required fields to prevent crashes and return 400
    if (!paymentInfo || !paymentInfo.id) {
        return next(new ErrorHandler("Payment Information is required", 400));
    }
    if (!orderItems || orderItems.length === 0) {
        return next(new ErrorHandler("Order Items are required", 400));
    }

    // BUG-005 FIX: compare paymentInfo.id, not the entire object
    const orderExist = await Order.findOne({ 'paymentInfo.id': paymentInfo.id });
    if (orderExist) {
        return next(new ErrorHandler("Order Already Placed", 400));
    }

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
        couponCode,
        couponDiscount,
        paymentMethod: paymentInfo.status === 'COD' ? 'COD' : 'Razorpay',
        paidAt: Date.now(),
        user: req.user._id,
    });

    try {
        await sendEmail({
            email: req.user.email,
            subject: "Order Confirmation",
            data: {
                name: req.user.name,
                shippingInfo,
                orderItems,
                totalPrice,
                paymentInfo,
                paidAt: order.paidAt,
                oid: order._id,
                status: "Placed",
                message: "Thank you for your order! We will process it soon.",
                couponCode,
                couponDiscount,
            },
        });
    } catch (emailErr) {
        // Don't fail the order if email fails
        console.error('Order confirmation email failed:', emailErr.message);
    }

    res.status(201).json({ success: true, order });
});

// Get Single Order Details
exports.getSingleOrderDetails = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }
    res.status(200).json({ success: true, order });
});

// Get Logged In User Orders
exports.myOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
});

// Get All Orders — ADMIN
exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {
    const orders = await Order.find().sort({ createdAt: -1 });

    // BUG-006/007 FIX: .find() always returns array, removed false null check
    let totalAmount = 0;
    orders.forEach((order) => { totalAmount += order.totalPrice; });

    res.status(200).json({ success: true, orders, totalAmount });
});

// Update Order Status — ADMIN
exports.updateOrder = asyncErrorHandler(async (req, res, next) => {

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    if (order.orderStatus === 'Delivered') {
        return next(new ErrorHandler("This order has already been delivered", 400));
    }

    const newStatus = req.body.status;

    // Enforce status flow — prevent skipping steps (e.g., Processing → Delivered)
    const allowedNextStatuses = STATUS_FLOW[order.orderStatus] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
        return next(
            new ErrorHandler(
                `Cannot change status from '${order.orderStatus}' to '${newStatus}'. Allowed: ${allowedNextStatuses.join(', ') || 'none'}`,
                400
            )
        );
    }

    if (newStatus === 'Shipped') {
        order.shippedAt = Date.now();

        // BUG-008 FIX: use Promise.all so stock updates are properly awaited
        await Promise.all(
            order.orderItems.map((item) => updateStock(item.product, item.quantity))
        );

        try {
            await sendEmail({
                email: order.user.email,
                subject: "Order Shipped",
                data: {
                    name: order.user.name,
                    orderItems: order.orderItems,
                    shippingInfo: order.shippingInfo,
                    totalPrice: order.totalPrice,
                    paymentInfo: order.paymentInfo,
                    oid: order._id,
                    status: "Shipped",
                    message: "Your order has been shipped and is on its way!",
                    couponCode: order.couponCode,
                    couponDiscount: order.couponDiscount,
                    paidAt: order.paidAt,
                },
            });
        } catch (emailErr) {
            console.error('Shipped email failed:', emailErr.message);
        }
    }

    order.orderStatus = newStatus;

    if (newStatus === 'Delivered') {
        order.deliveredAt = Date.now();

        try {
            await sendEmail({
                email: order.user.email,
                subject: "Order Delivered",
                data: {
                    name: order.user.name,
                    orderItems: order.orderItems,
                    shippingInfo: order.shippingInfo,
                    totalPrice: order.totalPrice,
                    paymentInfo: order.paymentInfo,
                    oid: order._id,
                    status: "Delivered",
                    message: "Your order has been delivered successfully!",
                    couponCode: order.couponCode,
                    couponDiscount: order.couponDiscount,
                    paidAt: order.paidAt,
                },
            });
        } catch (emailErr) {
            console.error('Delivered email failed:', emailErr.message);
        }
    }

    if (newStatus === 'Cancelled') {
        // 💰 Auto refund to UPI/Razorpay source if paid
        if (order.paymentMethod === 'Razorpay' && order.paymentStatus === 'Paid') {
            try {
                const razorpayService = require('../services/razorpayService');
                const refund = await razorpayService.refundPayment(order.paymentDetails.razorpayPaymentId);
                order.paymentStatus = 'Refunded';
                if (order.paymentDetails) {
                    order.paymentDetails.razorpayRefundId = refund.id;
                }
            } catch (refundErr) {
                console.error("Auto-refund failed during admin cancellation:", refundErr.message);
            }
        }
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: `Order status updated to ${newStatus}` });
});

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    if (product) {
        product.stock = Math.max(0, product.stock - quantity);
        await product.save({ validateBeforeSave: false });
    }
}

// Delete Order — ADMIN
exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }
    await order.deleteOne();
    res.status(200).json({ success: true, message: "Order Deleted Successfully" });
});