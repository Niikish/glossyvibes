const express = require('express');
const { getAdminStats } = require('../controllers/adminController');
const { getPaymentStats, getSettlements } = require('../controllers/paymentAnalyticsController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router
    .route('/admin/stats')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getAdminStats);

router
    .route('/admin/payment/stats')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getPaymentStats);

router
    .route('/admin/settlements')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getSettlements);

module.exports = router;
