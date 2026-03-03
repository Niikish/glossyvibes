const express = require('express');
const { processPayment, paytmResponse, getPaymentStatus, processCODPayment, processPaytmPayment, sendStripeApiKey, verifyPayment, createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook, refundRazorpayPayment } = require('../controllers/paymentController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const { verifyRazorpaySignature, verifyWebhookSignature } = require('../middlewares/verifyRazorpaySignature');

const router = express.Router();

router.route('/payment/process').post(isAuthenticatedUser, processPayment);
router.route('/payment/verify').post(isAuthenticatedUser, verifyPayment);
router.route('/payment/paytm/process').post(processPaytmPayment);
router.route('/payment/cod/process').post(isAuthenticatedUser, processCODPayment);
router.route('/stripeapikey').get(isAuthenticatedUser, sendStripeApiKey);

router.route('/callback').post(paytmResponse);

// Razorpay specific routes
router.route('/payment/razorpay/create-order').post(isAuthenticatedUser, createRazorpayOrder);
router.route('/payment/razorpay/verify').post(isAuthenticatedUser, verifyRazorpaySignature, verifyRazorpayPayment);
router.route('/payment/razorpay/webhook').post(express.raw({ type: 'application/json' }), verifyWebhookSignature, razorpayWebhook);
router.route('/admin/payments/refund/:orderId').post(isAuthenticatedUser, authorizeRoles('admin'), refundRazorpayPayment);

router.route('/payment/status/:id').get(isAuthenticatedUser, getPaymentStatus);

module.exports = router;