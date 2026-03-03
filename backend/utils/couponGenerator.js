const Coupon = require('../models/Coupon');
const sendEmail = require('./sendEmail');
const welcomeCouponEmail = require('../emails/welcomeCouponEmail');
const monthlyCouponEmail = require('../emails/monthlyCouponEmail');
const crypto = require('crypto');

/**
 * Generate a formatted coupon code
 */
const generateCouponCode = (type, userId) => {
    const userIdPart = userId.toString().slice(-6).toUpperCase();
    if (type === 'welcome') {
        const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
        return `WELCOME-${userIdPart}-${randomPart}`;
    } else {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `MONTHLY-${userIdPart}-${month}${year}`;
    }
};

/**
 * Generate and send welcome coupon
 */
const generateWelcomeCoupon = async (userId, email) => {
    try {
        // Idempotency check: don't create multiple welcome coupons for the same user
        const existing = await Coupon.findOne({ userId, type: 'welcome' });
        if (existing) return existing;

        const code = generateCouponCode('welcome', userId);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const coupon = await Coupon.create({
            code,
            userId,
            type: 'welcome',
            expiresAt
        });

        // Send Email
        const htmlContent = welcomeCouponEmail(code, expiresAt);
        await sendEmail({
            email,
            subject: "🎉 Welcome Gift! Here's ₹50 off your first order",
            html: htmlContent
        });

        return coupon;
    } catch (error) {
        console.error('Welcome coupon generation failed:', error);
        return null; // Silent failure per requirements
    }
};

/**
 * Generate and send monthly coupon
 */
const generateMonthlyCoupon = async (user) => {
    try {
        const userId = user._id || user.id;
        const code = generateCouponCode('monthly', userId);

        // Idempotency: skip if already exists for this month/code
        const existing = await Coupon.findOne({ code });
        if (existing) return;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await Coupon.create({
            code,
            userId,
            type: 'monthly',
            expiresAt
        });

        // Send Email
        const htmlContent = monthlyCouponEmail(code, expiresAt);
        await sendEmail({
            email: user.email,
            subject: "🎁 Your Monthly ₹50 Loyalty Reward is here!",
            html: htmlContent
        });

    } catch (error) {
        console.error(`Monthly coupon generation failed for user ${user._id}:`, error);
    }
};

module.exports = {
    generateWelcomeCoupon,
    generateMonthlyCoupon,
    generateCouponCode
};
