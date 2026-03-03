const express = require('express');
const router = express.Router();

const {
    createCoupon,
    getAllCoupons,
    getCouponDetails,
    updateCoupon,
    deleteCoupon,
    applyCoupon,
    redeemCoupon,
} = require('../controllers/couponController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// BUG-017 FIX: /coupon/apply and /coupon/redeem were fully public —
// now require authentication so random users can't abuse them
router.route('/coupon/apply').post(isAuthenticatedUser, applyCoupon);
router.route('/coupon/redeem').post(isAuthenticatedUser, redeemCoupon);

// Admin-only routes
router.route('/admin/coupons').get(isAuthenticatedUser, authorizeRoles('admin'), getAllCoupons);
router.route('/admin/coupon/new').post(isAuthenticatedUser, authorizeRoles('admin'), createCoupon);
router
    .route('/admin/coupon/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getCouponDetails)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateCoupon)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCoupon);

module.exports = router;