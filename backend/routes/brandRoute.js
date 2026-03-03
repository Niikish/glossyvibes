const express = require('express');
const { getAllBrands, createBrand, updateBrand, deleteBrand, getFeaturedBrands } = require('../controllers/brandController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/brands').get(getAllBrands);
router.route('/brands/featured').get(getFeaturedBrands);

// Admin Routes
router.route('/admin/brand/new').post(isAuthenticatedUser, authorizeRoles("admin"), createBrand);
router.route('/admin/brand/:id')
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateBrand)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBrand);

module.exports = router; 