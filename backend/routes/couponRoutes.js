const express = require('express');
const router = express.Router();
const { validateCoupon, getMyCoupons, markUsed } = require('../controllers/couponController');
const { isAuthenticatedUser } = require('../middlewares/auth');
const { couponRateLimiter } = require('../middlewares/couponGuard');

router.route('/coupons/validate').post(isAuthenticatedUser, couponRateLimiter, validateCoupon);
router.route('/coupons/my-coupons').get(isAuthenticatedUser, getMyCoupons);
router.route('/coupons/mark-used').patch(isAuthenticatedUser, markUsed);

module.exports = router;
