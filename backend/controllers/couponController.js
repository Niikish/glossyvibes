const Coupon = require('../models/Coupon');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');

// Validate Coupon   =>   POST /api/coupons/validate
exports.validateCoupon = asyncErrorHandler(async (req, res, next) => {
    const { code, cartTotal } = req.body;
    const userId = req.user.id; // From JWT

    if (!code) {
        return next(new ErrorHandler("Please enter coupon code", 400));
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
        return next(new ErrorHandler("Coupon not found", 404));
    }

    // Check ownership
    if (coupon.userId.toString() !== userId.toString()) {
        return next(new ErrorHandler("Coupon not valid for your account", 403));
    }

    // Check usage
    if (coupon.isUsed) {
        return next(new ErrorHandler("Coupon has already been used", 400));
    }

    // Check expiry
    if (coupon.isExpired || new Date() > new Date(coupon.expiresAt)) {
        // Update isExpired if needed
        if (!coupon.isExpired) {
            coupon.isExpired = true;
            await coupon.save();
        }
        return next(new ErrorHandler("Coupon has expired", 400));
    }

    const discountAmount = coupon.discountAmount;
    const finalTotal = Math.max(0, cartTotal - discountAmount);

    res.status(200).json({
        success: true,
        valid: true,
        discountAmount,
        finalTotal,
        message: "Coupon applied successfully"
    });
});

// Get My Coupons   =>   GET /api/coupons/my-coupons
exports.getMyCoupons = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user.id;

    const coupons = await Coupon.find({ userId }).sort({
        isUsed: 1,      // Active first (false < true)
        isExpired: 1,   // Non-expired first
        createdAt: -1   // Newest first
    });

    res.status(200).json({
        success: true,
        coupons
    });
});

// Mark used (Internal/Internal use)   =>   PATCH /api/coupons/mark-used
exports.markUsed = asyncErrorHandler(async (req, res, next) => {
    const { code, orderId } = req.body;
    const userId = req.user.id;

    const coupon = await Coupon.findOneAndUpdate(
        {
            code: code.toUpperCase(),
            userId,
            isUsed: false,
            isExpired: false,
            expiresAt: { $gt: Date.now() }
        },
        {
            isUsed: true,
            usedAt: Date.now(),
            usedInOrder: orderId
        },
        { new: true }
    );

    if (!coupon) {
        return next(new ErrorHandler("Coupon could not be marked as used (not found, already used, or expired)", 400));
    }

    res.status(200).json({
        success: true,
        message: "Coupon marked as used",
        coupon
    });
});