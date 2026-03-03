const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn('Razorpay keys are missing from environment variables.');
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
        });
    }
    return razorpayInstance;
};

exports.createOrder = async (amount, currency = 'INR', receipt = 'receipt') => {
    try {
        const instance = getRazorpayInstance();
        const options = {
            amount: Math.round(amount * 100), // convert to paise minimum
            currency,
            receipt,
            payment_capture: 1 // automatic capture
        };
        const order = await instance.orders.create(options);
        return order;
    } catch (error) {
        throw new Error(error.message || 'Razorpay order creation failed');
    }
};

exports.fetchPayment = async (paymentId) => {
    try {
        const instance = getRazorpayInstance();
        return await instance.payments.fetch(paymentId);
    } catch (error) {
        throw new Error(error.message || 'Error fetching Razorpay payment details');
    }
};

exports.refundPayment = async (paymentId, amount, speed = 'normal') => {
    try {
        const instance = getRazorpayInstance();
        const refundOptions = {
            speed
        };
        // if amount is provided, partial refund. otherwise full refund.
        if (amount) {
            refundOptions.amount = Math.round(amount * 100);
        }
        return await instance.payments.refund(paymentId, refundOptions);
    } catch (error) {
        throw new Error(error.message || 'Razorpay refund failed');
    }
};
