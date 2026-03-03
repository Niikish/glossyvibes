const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    highlights: [
        {
            type: String,
            required: true,
        },
    ],
    specifications: [
        {
            title: { type: String, required: true },
            description: { type: String, required: true },
        },
    ],
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        min: [0, 'Price cannot be negative'],
    },
    cuttedPrice: {
        type: Number,
        required: [true, 'Please enter cutted price'],
        min: [0, 'Cutted price cannot be negative'],
    },
    images: [
        {
            public_id: { type: String, required: true },
            url: { type: String, required: true },
        },
    ],
    brand: {
        type: mongoose.Schema.ObjectId,
        ref: 'Brand',
        required: [true, 'Please select a brand'],
    },
    category: {
        type: String,
        required: [true, 'Please select a product category'],
        lowercase: true,
        trim: true,
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        // BUG-019 FIX: maxlength is for strings — use max for Numbers
        max: [9999, 'Stock cannot exceed 9999 units'],
        min: [0, 'Stock cannot be negative'],
        default: 1,
    },
    ratings: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true,
            },
            name: { type: String, required: true },
            rating: { type: Number, required: true },
            comment: { type: String, required: true },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// ── Indexes for performance at scale ──────────────────────────────────
productSchema.index({ name: 'text', description: 'text' }); // full-text search
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });

productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);