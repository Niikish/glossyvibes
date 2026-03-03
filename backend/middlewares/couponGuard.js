const rateLimit = require('express-rate-limit');

// Rate limit coupon validation: max 10 attempts per hour per user
exports.couponRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        message: "Too many coupon validation attempts. Please try again in an hour."
    },
    keyGenerator: (req) => req.user ? req.user.id : req.ip,
    standardHeaders: true,
    legacyHeaders: false,
});
