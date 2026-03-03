const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please enter coupon code'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['welcome', 'monthly'],
    },
    discountAmount: {
        type: Number,
        default: 50,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    usedAt: {
        type: Date,
    },
    usedInOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    issuedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    isExpired: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
});

// Compound index on { userId, type, isUsed }
couponSchema.index({ userId: 1, type: 1, isUsed: 1 });
// Unique index on { code } - handled by 'unique: true' above, but explicit for clarity if needed
couponSchema.index({ code: 1 }, { unique: true });
// Index on { expiresAt } for cron cleanup
couponSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
