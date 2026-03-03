const express = require('express');
const rateLimit = require('express-rate-limit');
const { getLocationByPincode } = require('../controllers/locationController');

const router = express.Router();

// Strict rate limiter for pincode lookups: Max 10 requests per 15 minutes per IP
const locationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { success: false, message: 'Too many location lookups, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.route('/location/pincode/:pincode').get(locationLimiter, getLocationByPincode);

module.exports = router;
