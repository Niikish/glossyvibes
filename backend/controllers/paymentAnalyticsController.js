const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel');
const PaymentAnalytics = require('../models/paymentAnalyticsModel');
const Settlement = require('../models/settlementModel');

// Get Overall Payment Stats — ADMIN
exports.getPaymentStats = asyncErrorHandler(async (req, res, next) => {
    const stats = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalPrice" },
                totalOrders: { $sum: 1 },
                upiOrders: {
                    $sum: { $cond: [{ $eq: ["$paymentMethod", "Razorpay"] }, 1, 0] } // Approximation as UPI is via Razorpay
                },
                codOrders: {
                    $sum: { $cond: [{ $eq: ["$paymentMethod", "COD"] }, 1, 0] }
                },
                paidOrders: {
                    $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] }
                },
                refundedOrders: {
                    $sum: { $cond: [{ $eq: ["$paymentStatus", "Refunded"] }, 1, 0] }
                }
            }
        }
    ]);

    // Get time-series data from PaymentAnalytics
    const timeSeriesData = await PaymentAnalytics.find().sort({ date: 1 }).limit(30);

    res.status(200).json({
        success: true,
        stats: stats[0] || {},
        timeSeriesData
    });
});

// Get Settlements — ADMIN
exports.getSettlements = asyncErrorHandler(async (req, res, next) => {
    const settlements = await Settlement.find().sort({ settledAt: -1 });
    res.status(200).json({
        success: true,
        settlements
    });
});
