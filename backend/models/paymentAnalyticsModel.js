const mongoose = require('mongoose');

const paymentAnalyticsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    totalPayments: {
        type: Number,
        default: 0
    },
    totalUPIPayments: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    refunds: {
        type: Number,
        default: 0
    },
    failedPayments: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('PaymentAnalytics', paymentAnalyticsSchema);
