const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const cloudinary = require('cloudinary');

// Create a new category -- Admin only
exports.createCategory = asyncErrorHandler(async (req, res, next) => {
    let image = {};

    if (req.body.image) {
        const result = await cloudinary.v2.uploader.upload(req.body.image, {
            folder: 'categories',
        });
        image = { public_id: result.public_id, url: result.secure_url };
    }

    req.body.image = image;
    const category = await Category.create(req.body);

    res.status(201).json({ success: true, category });
});

// Get all categories
exports.getAllCategories = asyncErrorHandler(async (req, res, next) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories });
});

// Get Main Categories Only (for dropdown / product forms)
exports.getMainCategories = asyncErrorHandler(async (req, res, next) => {
    const categories = await Category.find({ parent: null }).sort({ name: 1 });
    res.status(200).json({ success: true, categories });
});

// Get subcategories of a parent category
exports.getSubCategories = asyncErrorHandler(async (req, res, next) => {
    const { parentId } = req.params;
    const categories = await Category.find({ parent: parentId }).sort({ name: 1 });
    res.status(200).json({ success: true, categories });
});

// Get a single category
exports.getCategoryDetails = asyncErrorHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorHandler('Category not found', 404));
    }
    res.status(200).json({ success: true, category });
});

// Update a category -- Admin only
exports.updateCategory = asyncErrorHandler(async (req, res, next) => {
    let category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorHandler('Category not found', 404));
    }

    if (req.body.image) {
        if (category.image && category.image.public_id) {
            await cloudinary.v2.uploader.destroy(category.image.public_id);
        }
        const result = await cloudinary.v2.uploader.upload(req.body.image, {
            folder: 'categories',
        });
        req.body.image = { public_id: result.public_id, url: result.secure_url };
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, category });
});

// Delete a category -- Admin only
exports.deleteCategory = asyncErrorHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorHandler('Category not found', 404));
    }

    const productsWithCategory = await Product.countDocuments({ category: category._id });
    if (productsWithCategory > 0) {
        return next(
            new ErrorHandler(
                `Cannot delete: ${productsWithCategory} product(s) are linked to this category`,
                400
            )
        );
    }

    const subCategories = await Category.countDocuments({ parent: category._id });
    if (subCategories > 0) {
        return next(
            new ErrorHandler(
                `Cannot delete: ${subCategories} subcategory(ies) exist under this category`,
                400
            )
        );
    }

    if (category.image && category.image.public_id) {
        await cloudinary.v2.uploader.destroy(category.image.public_id);
    }

    // BUG-011 FIX: .remove() is deprecated; use deleteOne()
    await category.deleteOne();

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
});