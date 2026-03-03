const Brand = require('../models/brandModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require('cloudinary').v2;

// Create Brand -- Admin
exports.createBrand = asyncErrorHandler(async (req, res, next) => {
    if (!req.body.logo) {
        return next(new ErrorHandler("Please provide a brand logo", 400));
    }

    let logoCloud = {};

    if (req.body.logo) {
        const myCloud = await cloudinary.uploader.upload(req.body.logo, {
            folder: "brands",
            crop: "scale",
        });

        logoCloud = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    }

    const brand = await Brand.create({
        name: req.body.name,
        description: req.body.description,
        logo: logoCloud,
        featured: req.body.featured
    });

    res.status(201).json({
        success: true,
        brand,
    });
});

// Get All Brands
exports.getAllBrands = asyncErrorHandler(async (req, res, next) => {
    const brands = await Brand.find();

    res.status(200).json({
        success: true,
        brands,
    });
});

// Get Featured Brands
exports.getFeaturedBrands = asyncErrorHandler(async (req, res, next) => {
    const brands = await Brand.find({ featured: true });

    res.status(200).json({
        success: true,
        brands,
    });
});

// Update Brand -- Admin
exports.updateBrand = asyncErrorHandler(async (req, res, next) => {
    const newBrandData = {
        name: req.body.name,
        description: req.body.description,
        featured: req.body.featured,
        updatedAt: Date.now()
    };

    if (req.body.logo && req.body.logo.trim() !== '') {
        const brand = await Brand.findById(req.params.id);
        
        if (!brand) {
            return next(new ErrorHandler(`Brand not found with id: ${req.params.id}`, 404));
        }
        
        if (brand.logo && brand.logo.public_id) {
            const imageId = brand.logo.public_id;
            await cloudinary.uploader.destroy(imageId);
        }

        const myCloud = await cloudinary.uploader.upload(req.body.logo, {
            folder: "brands",
            crop: "scale",
        });

        newBrandData.logo = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    }

    const brand = await Brand.findByIdAndUpdate(req.params.id, newBrandData, {
        new: true,
        runValidators: true
    });

    if (!brand) {
        return next(new ErrorHandler(`Brand not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        brand
    });
});

// Delete Brand -- Admin
exports.deleteBrand = asyncErrorHandler(async (req, res, next) => {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
        return next(new ErrorHandler(`Brand not found with id: ${req.params.id}`, 404));
    }

    if (brand.logo && brand.logo.public_id) {
        const imageId = brand.logo.public_id;
        await cloudinary.uploader.destroy(imageId);
    }

    await Brand.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Brand deleted successfully",
    });
}); 