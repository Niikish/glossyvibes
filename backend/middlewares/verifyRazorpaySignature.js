const crypto = require('crypto');
const ErrorHandler = require('../utils/errorHandler');

exports.verifyRazorpaySignature = (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return next(new ErrorHandler("Payment verification failed: Missing required fields", 400));
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return next(new ErrorHandler("Internal server error: Razorpay secret not configured", 500));
        }

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return next(new ErrorHandler("Payment verification failed: Signature mismatch", 400));
        }

        // Add to req so downstream controllers can use it
        req.razorpayDetails = {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        };

        next();
    } catch (error) {
        return next(new ErrorHandler("Payment verification runtime error", 500));
    }
};

exports.verifyWebhookSignature = (req, res, next) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const requestedSignature = req.headers['x-razorpay-signature'];

        if (!secret) {
            console.warn("Razorpay webhook executed but RAZORPAY_WEBHOOK_SECRET is empty");
            return next(new ErrorHandler("Internal Server Error: Webhook secret missing", 500));
        }

        if (!requestedSignature) {
            return next(new ErrorHandler("Signature is missing from webhook request", 400));
        }

        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(req.body)
            .digest('hex');

        if (generatedSignature !== requestedSignature) {
            return next(new ErrorHandler("Invalid Webhook Signature", 400));
        }

        next();
    } catch (error) {
        return next(new ErrorHandler("Webhook verification runtime error", 500));
    }
};
