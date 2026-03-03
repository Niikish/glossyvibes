const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please enter coupon code'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    type: {
        type: String,
        required: [true, 'Please select discount type'],
        enum: {
            values: ['Percentage', 'Fixed'],
            message: 'Discount type must be either Percentage or Fixed',
        },
    },
    value: {
        type: Number,
        required: [true, 'Please enter discount value'],
        min: [1, 'Discount cannot be less than 1'],
    },
    minPurchase: {
        type: Number,
        required: [true, 'Please enter minimum purchase amount'],
        min: [0, 'Minimum purchase cannot be less than 0'],
    },
    maxDiscount: {
        type: Number,
        required: function () {
            return this.type === 'Percentage';
        },
        min: [0, 'Maximum discount cannot be less than 0'],
    },
    validFrom: {
        type: Date,
        required: [true, 'Please enter valid from date'],
    },
    validUntil: {
        type: Date,
        required: [true, 'Please enter valid until date'],
        validate: {
            validator: function (value) {
                return value > this.validFrom;
            },
            message: 'Valid until date must be after valid from date',
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usageLimit: {
        type: Number,
        required: [true, 'Please enter usage limit'],
        min: [1, 'Usage limit cannot be less than 1'],
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        trim: true,
    },
    usedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Method to check if a coupon is valid for a given purchase amount
couponSchema.methods.isValidForPurchase = function (purchaseAmount) {
    const now = new Date();

    // Check if the coupon is active
    if (!this.isActive) {
        return {
            valid: false,
            message: 'This coupon is inactive',
        };
    }

    // Check if the coupon has exceeded its usage limit
    if (this.usageCount >= this.usageLimit) {
        return {
            valid: false,
            message: 'This coupon has reached its usage limit',
        };
    }

    // Check if the coupon is expired
    if (now < this.validFrom || now > this.validUntil) {
        return {
            valid: false,
            message: 'This coupon is not valid at this time',
        };
    }

    // Check if the purchase amount meets the minimum requirement
    if (purchaseAmount < this.minPurchase) {
        return {
            valid: false,
            message: `Minimum purchase amount should be ₹{this.minPurchase}`,
        };
    }

    return {
        valid: true,
        message: 'Coupon is valid',
    };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (purchaseAmount) {
    if (this.type === 'Percentage') {
        // Calculate percentage discount
        const discountAmount = (purchaseAmount * this.value) / 100;

        // Apply maximum discount cap if it's a percentage discount
        return Math.min(discountAmount, this.maxDiscount);
    } else {
        // For fixed discount, just return the discount value
        return Math.min(this.value, purchaseAmount);
    }
};

module.exports = mongoose.model('Coupon', couponSchema); 