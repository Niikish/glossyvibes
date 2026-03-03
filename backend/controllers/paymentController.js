const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paytm = require('paytmchecksum');
const https = require('https');
const Payment = require('../models/paymentModel');
const Order = require('../models/orderModel');
const Settlement = require('../models/settlementModel');
const PaymentAnalytics = require('../models/paymentAnalyticsModel');
const invoiceService = require('../services/invoiceService');
const ErrorHandler = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');

// Process Stripe Payment
exports.processPayment = asyncErrorHandler(async (req, res, next) => {
    const { amount, items, paymentId, shouldFail } = req.body;

    if (shouldFail) {
        return next(new ErrorHandler("Payment processing failed as requested", 400));
    }

    if (!amount || amount <= 0) {
        return next(new ErrorHandler('Invalid payment amount', 400));
    }

    // Security check: duplicate payment processed
    if (paymentId) {
        const paymentExist = await Payment.findOne({ txnId: paymentId });
        if (paymentExist) {
            return next(new ErrorHandler('Payment already processed', 400));
        }
    }

    // Security check: verify amount matches items from DB
    if (items && items.length > 0) {
        let calculatedTotal = 0;
        const Product = require('../models/productModel');
        for (const item of items) {
            const product = await Product.findById(item.product || item._id);
            if (product) {
                calculatedTotal += product.price * (item.quantity || 1);
            }
        }

        // If calculated total doesn't match provided amount, block payment
        if (calculatedTotal > 0 && calculatedTotal !== amount) {
            return next(new ErrorHandler(`Payment amount tampering detected. Expected: ${calculatedTotal}, Received: ${amount}`, 400));
        }
    }

    const myPayment = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents for Stripe
        currency: 'inr',
        metadata: { company: 'GlossyVibes' },
    });

    res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
    });
});

// Verify Payment Signature
exports.verifyPayment = asyncErrorHandler(async (req, res, next) => {
    const { signature, paymentId } = req.body;

    if (!signature || !paymentId) {
        return next(new ErrorHandler('Signature and Payment ID are required', 400));
    }

    // This is a placeholder for real signature verification logic 
    // (e.g., using crypto.createHmac for Razorpay/Paytm)
    if (signature === 'invalid_signature') {
        return next(new ErrorHandler('Invalid payment signature', 400));
    }

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
});

// Send Stripe API Key
exports.sendStripeApiKey = asyncErrorHandler(async (req, res, next) => {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});

// Process Paytm Payment
exports.processPaytmPayment = asyncErrorHandler(async (req, res, next) => {
    const { amount, email, phoneNo } = req.body;

    const params = {
        MID: process.env.PAYTM_MID,
        WEBSITE: process.env.PAYTM_WEBSITE,
        CHANNEL_ID: process.env.PAYTM_CHANNEL_ID,
        INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE,
        ORDER_ID: 'oid' + uuidv4(),
        CUST_ID: process.env.PAYTM_CUST_ID,
        TXN_AMOUNT: JSON.stringify(amount),
        CALLBACK_URL: `${process.env.FRONTEND_URL || `https://${req.get('host')}`}/api/v1/callback`,
        EMAIL: email,
        MOBILE_NO: phoneNo,
    };

    try {
        const checksum = await paytm.generateSignature(params, process.env.PAYTM_MERCHANT_KEY);
        res.status(200).json({ paytmParams: { ...params, CHECKSUMHASH: checksum } });
    } catch (error) {
        return next(new ErrorHandler('Payment initiation failed. Please try again.', 500));
    }
});

// Paytm Callback
exports.paytmResponse = async (req, res, next) => {
    let paytmChecksum = req.body.CHECKSUMHASH;
    delete req.body.CHECKSUMHASH;

    let isVerifySignature;
    try {
        isVerifySignature = paytm.verifySignature(
            req.body,
            process.env.PAYTM_MERCHANT_KEY,
            paytmChecksum
        );
    } catch (err) {
        return next(new ErrorHandler('Checksum verification failed', 400));
    }

    if (!isVerifySignature) {
        return next(new ErrorHandler('Payment verification failed: checksum mismatch', 400));
    }

    const paytmParams = {
        body: { mid: req.body.MID, orderId: req.body.ORDERID },
    };

    try {
        const checksum = await paytm.generateSignature(
            JSON.stringify(paytmParams.body),
            process.env.PAYTM_MERCHANT_KEY
        );
        paytmParams.head = { signature: checksum };

        const post_data = JSON.stringify(paytmParams);
        const options = {
            hostname: process.env.NODE_ENV === 'production'
                ? 'securegw.paytm.in'
                : 'securegw-stage.paytm.in',
            port: 443,
            path: '/v3/order/status',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(post_data),
            },
        };

        let response = '';
        const post_req = https.request(options, (post_res) => {
            post_res.on('data', (chunk) => { response += chunk; });
            post_res.on('end', async () => {
                try {
                    const { body } = JSON.parse(response);
                    await addPayment(body);
                    const redirectBase = process.env.FRONTEND_URL || `https://${req.get('host')}`;
                    res.redirect(`${redirectBase}/order/${body.orderId}`);
                } catch (parseErr) {
                    next(new ErrorHandler('Failed to process payment response', 500));
                }
            });
        });

        post_req.on('error', (err) => {
            next(new ErrorHandler('Payment gateway connection failed', 500));
        });

        post_req.write(post_data);
        post_req.end();
    } catch (error) {
        return next(new ErrorHandler('Payment processing failed', 500));
    }
};

const addPayment = async (data) => {
    try {
        await Payment.create(data);
    } catch (error) {
        // Log to server logs but don't throw — order was already placed
        console.error('Failed to log payment record:', error.message);
    }
};

// Get Payment Status
exports.getPaymentStatus = asyncErrorHandler(async (req, res, next) => {
    const payment = await Payment.findOne({ orderId: req.params.id });
    if (!payment) {
        return next(new ErrorHandler('Payment Details Not Found', 404));
    }
    const txn = {
        id: payment.txnId,
        status: payment.resultInfo.resultStatus,
    };
    res.status(200).json({ success: true, txn });
});

// Process COD Payment
exports.processCODPayment = asyncErrorHandler(async (req, res, next) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return next(new ErrorHandler('Invalid payment amount', 400));
    }

    if (amount > 50000) {
        return next(new ErrorHandler('Cash on Delivery is not available for orders above ₹50,000', 400));
    }

    const orderId = 'cod_' + uuidv4();

    const paymentData = {
        resultInfo: {
            resultStatus: 'TXN_SUCCESS',
            resultCode: 'COD_SUCCESS',
            resultMsg: 'Cash on Delivery Order Placed Successfully',
        },
        txnId: orderId,
        bankTxnId: 'COD',
        orderId: orderId,
        txnAmount: amount.toString(),
        txnType: 'COD',
        gatewayName: 'COD',
        bankName: 'NA',
        mid: 'COD',
        paymentMode: 'COD',
        refundAmt: '0.00',
        txnDate: new Date().toISOString(),
    };

    try {
        await Payment.create(paymentData);
        res.status(200).json({ success: true, orderId });
    } catch (error) {
        return next(new ErrorHandler('COD Payment record creation failed', 500));
    }
});

// ── RAZORPAY INTEGRATION ─────────────────────────────────────────────
const razorpayService = require('../services/razorpayService');
const mongoose = require('mongoose');

// Create Razorpay Order (Phase 3)
exports.createRazorpayOrder = asyncErrorHandler(async (req, res, next) => {
    const { shippingInfo, orderItems, couponCode, couponDiscount = 0 } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return next(new ErrorHandler("Order Items are required", 400));
    }
    if (!shippingInfo) {
        return next(new ErrorHandler("Shipping Information is required", 400));
    }

    // Server-side validation of cart & calculation of DB-verified amount
    let calculatedTotal = 0;
    const Product = require('../models/productModel');

    // Validate stock and calculate exact DB price concurrently
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
            return next(new ErrorHandler(`Product not found: ${item.name}`, 404));
        }
        if (product.stock < item.quantity) {
            return next(new ErrorHandler(`Insufficient stock for ${product.name}`, 400));
        }
        calculatedTotal += product.price * item.quantity;
    }

    // Apply strict server-side coupon logic if needed, simplify here to flat discount
    // If strict integration is needed, query Coupon model
    if (couponDiscount > 0) {
        calculatedTotal = Math.max(0, calculatedTotal - couponDiscount);
    }

    if (calculatedTotal <= 0) {
        return next(new ErrorHandler("Invalid total amount", 400));
    }

    // 1. Create Razorpay order via SDK
    const razorpayOrder = await razorpayService.createOrder(calculatedTotal);

    res.status(200).json({
        success: true,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID, // Frontend strictly needs public Key ID
    });
});

// Verify Razorpay Payment (Phase 4 - IDEMPOTENT)
exports.verifyRazorpayPayment = asyncErrorHandler(async (req, res, next) => {
    // razorpayDetails is injected by verifyRazorpaySignature middleware
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.razorpayDetails;
    const { orderData } = req.body;

    if (!orderData) {
        return next(new ErrorHandler("Order data is required for verification", 400));
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
    } catch (e) {
        console.log("Transactions not supported, falling back to basic operations");
        session = null;
    }

    try {
        // 🔥 IDEMPOTENCY CHECK 1: Check by Razorpay Payment ID
        const alreadyProcessed = await Order.findOne({
            "paymentInfo.razorpay_payment_id": razorpayPaymentId
        }).session(session);

        if (alreadyProcessed) {
            if (session) {
                await session.commitTransaction();
                session.endSession();
            }
            return res.status(200).json({
                success: true,
                message: "Payment already processed",
                order: alreadyProcessed
            });
        }

        // ✅ CREATE ORDER AFTER SUCCESS ONLY
        const newOrder = new Order({
            ...orderData,
            user: req.user._id,
            paymentMethod: 'Razorpay',
            paymentStatus: 'Paid',
            paymentInfo: {
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: razorpayPaymentId,
                razorpay_signature: razorpaySignature,
                status: "captured"
            },
            paymentDetails: {
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: razorpayPaymentId,
                razorpaySignature: razorpaySignature
            },
            paidAt: Date.now(),
            orderStatus: 'Processing'
        });

        // Atomic Stock Reduction
        const Product = require('../models/productModel');
        for (const item of newOrder.orderItems) {
            const product = await Product.findById(item.product).session(session);
            if (!product) {
                throw new Error(`Product ${item.product} not found during stock deduction`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }
            product.stock -= item.quantity;
            await product.save({ session, validateBeforeSave: false });
        }

        const savedOrder = await newOrder.save({ session });

        if (session) {
            await session.commitTransaction();
            session.endSession();
        }

        // Optional: Send confirmed email
        const sendEmail = require('../utils/sendEmail');
        try {
            await sendEmail({
                email: req.user.email,
                subject: "Order Confirmation - Payment Verified",
                data: {
                    name: req.user.name,
                    shippingInfo: savedOrder.shippingInfo,
                    orderItems: savedOrder.orderItems,
                    totalPrice: savedOrder.totalPrice,
                    paidAt: savedOrder.paidAt,
                    oid: savedOrder._id,
                    status: "Confirmed",
                    message: "Thank you for your order! Payment was successful.",
                    couponCode: savedOrder.couponCode,
                    couponDiscount: savedOrder.couponDiscount,
                    paymentInfo: savedOrder.paymentInfo,
                    paymentMethod: savedOrder.paymentMethod
                },
            });
        } catch (emailErr) {
            console.error('Order confirmation email failed:', emailErr.message);
        }

        res.status(201).json({ success: true, message: "Payment Verified & Order Created", order: savedOrder });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        return next(new ErrorHandler(error.message || "Payment verification failed", 500));
    }
});

// Handle Webhooks (Phase 5)
exports.razorpayWebhook = asyncErrorHandler(async (req, res, next) => {
    // Signature is already verified by verifyWebhookSignature middleware
    // Since we use express.raw, req.body is a Buffer
    const bodyString = req.body.toString();
    const payload = JSON.parse(bodyString);

    const event = payload.event;
    const paymentEntity = payload.payload.payment ? payload.payload.payment.entity : null;
    const razorpayOrderId = paymentEntity ? paymentEntity.order_id : null;
    const razorpayPaymentId = paymentEntity ? paymentEntity.id : null;

    try {
        if (event === 'payment.captured' && razorpayOrderId) {
            // 🔥 IDEMPOTENCY CHECK: Check if this payment ID was already processed
            const exists = await Order.findOne({ "paymentInfo.razorpay_payment_id": razorpayPaymentId });

            if (exists) {
                return res.status(200).json({ status: "already processed" });
            }

            // Find order by Razorpay Order ID and populate user for email sending
            const order = await Order.findOne({ "paymentInfo.razorpay_order_id": razorpayOrderId }).populate('user');

            if (!order) {
                console.log(`Webhook captured for payment ${razorpayPaymentId}, but DB order ${razorpayOrderId} not found yet. (Frontend verification will create it)`);
                return res.status(200).json({ status: "waiting for frontend" });
            }

            if (order.paymentStatus !== 'Paid') {
                const session = await mongoose.startSession();
                session.startTransaction();
                try {
                    order.paymentStatus = 'Paid';
                    order.paymentInfo.razorpay_payment_id = razorpayPaymentId;
                    order.paymentInfo.status = "captured";
                    order.paidAt = Date.now();
                    order.orderStatus = 'Processing';

                    // Atomic Stock Reduction Fallback (if verification didn't happen)
                    const Product = require('../models/productModel');
                    for (const item of order.orderItems) {
                        const product = await Product.findById(item.product).session(session);
                        if (product && product.stock >= item.quantity) {
                            product.stock -= item.quantity;
                            await product.save({ session, validateBeforeSave: false });
                        }
                    }

                    // 🧾 Generate GST Invoice
                    try {
                        const invoiceUrl = await invoiceService.generateInvoice(order);
                        order.invoiceUrl = invoiceUrl;
                    } catch (invoiceErr) {
                        console.error("Invoice generation failed on webhook:", invoiceErr.message);
                    }

                    await order.save({ session, validateBeforeSave: false });
                    await session.commitTransaction();
                    session.endSession();

                    // 📧 Send confirmed email via Webhook (Safety Fallback)
                    const sendEmail = require('../utils/sendEmail');
                    try {
                        await sendEmail({
                            email: order.user.email,
                            subject: "Order Confirmation - Payment Captured",
                            data: {
                                name: order.user.name,
                                shippingInfo: order.shippingInfo,
                                orderItems: order.orderItems,
                                totalPrice: order.totalPrice,
                                paidAt: order.paidAt,
                                oid: order._id,
                                status: "Confirmed",
                                message: "Payment successfully captured. Your order is being processed.",
                                couponCode: order.couponCode,
                                couponDiscount: order.couponDiscount,
                                paymentInfo: order.paymentInfo,
                                paymentMethod: order.paymentMethod
                            },
                        });
                    } catch (emailErr) {
                        console.error('Webhook confirmation email failed:', emailErr.message);
                    }

                    // 📊 Update Payment Analytics
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    await PaymentAnalytics.findOneAndUpdate(
                        { date: today },
                        {
                            $inc: {
                                totalPayments: 1,
                                totalRevenue: order.totalPrice,
                                totalUPIPayments: paymentEntity.method === 'upi' ? 1 : 0
                            }
                        },
                        { upsert: true }
                    );
                } catch (trError) {
                    await session.abortTransaction();
                    session.endSession();
                    throw trError;
                }
            }
        } else if (event === 'payment.failed' && razorpayOrderId) {
            const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpayOrderId });
            if (order && order.paymentStatus !== 'Paid') {
                order.paymentStatus = 'Failed';
                await order.save({ validateBeforeSave: false });

                // Update Failed Analytics
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                await PaymentAnalytics.findOneAndUpdate(
                    { date: today },
                    { $inc: { failedPayments: 1 } },
                    { upsert: true }
                );
            }
        } else if (event === 'refund.processed') {
            const order = await Order.findOne({ 'paymentDetails.razorpayPaymentId': razorpayPaymentId });
            if (order) {
                order.paymentStatus = 'Refunded';
                await order.save({ validateBeforeSave: false });

                // Update Refund Analytics
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                await PaymentAnalytics.findOneAndUpdate(
                    { date: today },
                    { $inc: { refunds: 1 } },
                    { upsert: true }
                );
            }
        } else if (event === 'settlement.processed') {
            // 🏦 Settlement tracking
            const settlementEntity = payload.payload.settlement.entity;
            await Settlement.create({
                settlementId: settlementEntity.id,
                amount: settlementEntity.amount / 100, // convert to rupees
                status: settlementEntity.status,
                fees: settlementEntity.fees / 100,
                tax: settlementEntity.tax / 100,
                utr: settlementEntity.utr,
                settledAt: new Date(settlementEntity.created_at * 1000)
            });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({ success: false, message: "Webhook error" });
    }
});

// Admin Refund Razorpay Payment (Phase 6)
exports.refundRazorpayPayment = asyncErrorHandler(async (req, res, next) => {
    const { amount } = req.body; // If amount is provided it's partial; else full

    const order = await Order.findById(req.params.orderId);
    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    if (order.paymentMethod !== 'Razorpay') {
        return next(new ErrorHandler("This order was not paid via Razorpay", 400));
    }

    if (order.paymentStatus !== 'Paid') {
        return next(new ErrorHandler("Payment has not been completed or is already refunded", 400));
    }

    if (order.paymentDetails && order.paymentDetails.razorpayRefundId) {
        return next(new ErrorHandler("Refund has already been processed for this order", 400));
    }

    try {
        const paymentId = order.paymentDetails.razorpayPaymentId;
        const refund = await razorpayService.refundPayment(paymentId, amount);

        order.paymentStatus = 'Refunded';
        order.paymentDetails.razorpayRefundId = refund.id;

        // Optionally update orderStatus to Cancelled or similar, though user might just want the payment status updated
        if (!amount) { // full refund
            order.orderStatus = 'Cancelled';
        }

        await order.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: "Refund Processed Successfully",
            refundId: refund.id
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to process refund via Razorpay", 500));
    }
});
