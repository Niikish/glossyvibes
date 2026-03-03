const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require('cloudinary');
const mongoose = require('mongoose');

// Get All Products (paginated + filtered)
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {

    const resultPerPage = 12;
    const productsCount = await Product.countDocuments();

    const queryObj = {};

    if (req.query.category) {
        const category = await mongoose.model('Category').findOne({ slug: req.query.category });
        if (category) {
            // Find all subcategories recursively
            const getAllSubCategoryIds = async (parentId) => {
                let subCats = await mongoose.model('Category').find({ parent: parentId });
                let slugs = [subCats.map(c => c.slug)];
                for (let subCat of subCats) {
                    const nestedSlugs = await getAllSubCategoryIds(subCat._id);
                    slugs = slugs.concat(nestedSlugs);
                }
                return slugs.flat();
            };

            const subSlugs = await getAllSubCategoryIds(category._id);
            queryObj.category = { $in: [category.slug, ...subSlugs] };
        } else {
            queryObj.category = req.query.category; // Fallback for direct matches if category meta not found
        }
    }

    if (req.query.keyword) {
        queryObj.name = {
            $regex: req.query.keyword,
            $options: "i",
        };
    }

    if (req.query.brand) {
        const brand = await mongoose.model('Brand').findOne({
            name: { $regex: new RegExp('^' + req.query.brand + '$', 'i') }
        });
        if (brand) {
            queryObj.brand = brand._id;
        } else {
            // If brand not found, ensure no products are returned
            queryObj.brand = new mongoose.Types.ObjectId();
        }
    }

    if (req.query.ratings) {
        queryObj.ratings = { $gte: Number(req.query.ratings) };
    }

    // Initialize SearchFeatures for other filters like price
    const searchFeature = new SearchFeatures(Product.find(queryObj), req.query)
        .filter();

    let productsQuery = searchFeature.query;

    // Populate brand (category is now a string slug)
    productsQuery = productsQuery.populate('brand', 'name');

    // Get count of filtered products
    let products = await productsQuery.clone();
    let filteredProductsCount = products.length;

    // Apply Pagination
    const currentPage = Number(req.query.page) || 1;
    const skip = resultPerPage * (currentPage - 1);
    productsQuery = productsQuery.limit(resultPerPage).skip(skip);

    products = await productsQuery;

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

// Get All Products — Product Sliders
exports.getProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find()
        .populate('brand', 'name')
        .populate('category', 'name');
    res.status(200).json({ success: true, products });
});

// Get Product Details
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
        .populate('brand', 'name')
        .populate('category', 'name');

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }
    res.status(200).json({ success: true, product });
});

// Get All Products — ADMIN
exports.getAdminProducts = asyncErrorHandler(async (req, res, next) => {
    // Populate both brand and category so frontend shows names, not ObjectIds
    const products = await Product.find()
        .populate('brand', 'name')
        .populate('category', 'name');

    res.status(200).json({ success: true, products });
});

// Create Product — ADMIN
exports.createProduct = asyncErrorHandler(async (req, res, next) => {

    let images = [];
    if (typeof req.body.images === 'string') {
        images.push(req.body.images);
    } else {
        images = req.body.images || [];
    }

    const imagesLink = [];
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'products',
        });
        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    req.body.images = imagesLink;
    req.body.user = req.user.id;

    // BUG-002 FIX: guard against undefined specifications
    let specs = [];
    if (req.body.specifications) {
        const rawSpecs = Array.isArray(req.body.specifications)
            ? req.body.specifications
            : [req.body.specifications];
        specs = rawSpecs.map((s) => (typeof s === 'string' ? JSON.parse(s) : s));
    }
    req.body.specifications = specs;

    const product = await Product.create(req.body);

    res.status(201).json({ success: true, product });
});

// Update Product — ADMIN
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {

    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    if (req.body.images !== undefined) {
        let images = [];
        if (typeof req.body.images === 'string') {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }
        // Destroy old images
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }
        const imagesLink = [];
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'products',
            });
            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.images = imagesLink;
    }

    // BUG-003 FIX: guard against undefined specifications
    if (req.body.specifications !== undefined) {
        const rawSpecs = Array.isArray(req.body.specifications)
            ? req.body.specifications
            : [req.body.specifications];
        req.body.specifications = rawSpecs.map((s) =>
            typeof s === 'string' ? JSON.parse(s) : s
        );
    }

    req.body.user = req.user.id;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, product });
});

// Delete Product — ADMIN
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.deleteOne();

    res.status(200).json({ success: true, message: "Product Deleted Successfully" });
});

// Create OR Update Reviews
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => { avg += rev.rating; });
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({ success: true });
});

// Get All Reviews of Product
exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
});

// Delete Review — ADMIN
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {

    // BUG-001 FIX: was `const product` which caused TypeError on reassignment below
    let product = await Product.findById(req.query.productId);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => { avg += rev.rating; });

    const ratings = reviews.length === 0 ? 0 : avg / reviews.length;
    const numOfReviews = reviews.length;

    product = await Product.findByIdAndUpdate(
        req.query.productId,
        { reviews, ratings: Number(ratings), numOfReviews },
        { new: true, runValidators: true }
    );

    res.status(200).json({ success: true });
});