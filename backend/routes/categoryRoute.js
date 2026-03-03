const express = require('express');
const { 
    getAllCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    getCategoryDetails,
    getMainCategories,
    getSubCategories
} = require('../controllers/categoryController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.route('/categories').get(getAllCategories);
router.route('/categories/main').get(getMainCategories);
router.route('/categories/sub/:parentId').get(getSubCategories);
router.route('/category/:id').get(getCategoryDetails);

// Admin routes
router.route('/admin/category/new')
    .post(isAuthenticatedUser, authorizeRoles('admin'), createCategory);

router.route('/admin/category/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateCategory)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCategory);

module.exports = router; 