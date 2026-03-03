const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    refundId: {
        type: String,
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['Razorpay', 'Wallet', 'Original'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processed', 'Failed'],
        default: 'Pending'
    },
    reason: {
        type: String,
        required: true
    },
    processedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Refund', refundSchema);
