const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        pincode: { type: Number, required: true },
        phoneNo: { type: Number, required: true },
    },
    orderItems: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true,
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Razorpay', 'COD', 'Wallet', 'Stripe', 'Paytm'],
        default: 'Razorpay',
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending',
    },
    paymentDetails: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        razorpayRefundId: String,
    },
    paymentInfo: {
        id: { type: String },
        razorpay_order_id: {
            type: String,
            index: true
        },
        razorpay_payment_id: {
            type: String,
            index: true,
            sparse: true
        },
        razorpay_signature: String,
        status: {
            type: String,
            enum: ["created", "authorized", "captured", "failed", "cancelled", "refunded", "COD"],
            default: "created"
        }
    },
    paidAt: { type: Date, required: true },
    totalPrice: { type: Number, required: true, default: 0 },
    couponCode: { type: String, trim: true },
    couponDiscount: { type: Number, default: 0 },
    orderStatus: {
        type: String,
        required: true,
        default: 'Processing',
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    },
    deliveredAt: Date,
    shippedAt: Date,
    invoiceUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// ── Indexes for performance at scale ──────────────────────────────────
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'paymentDetails.razorpayOrderId': 1 });
orderSchema.index({ 'paymentDetails.razorpayPaymentId': 1 });

module.exports = mongoose.model('Order', orderSchema);