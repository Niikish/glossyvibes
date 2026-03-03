const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    pincode: {
        type: String,
        required: [true, "Please enter a pincode"],
        trim: true,
        unique: true,
        index: true,
        match: [/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code"]
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true
    },
    state: {
        type: String,
        required: [true, "State is required"],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // TTL index: dynamically expire documents after 30 days (30 * 24 * 60 * 60 seconds = 2592000)
        expires: 2592000
    }
});

module.exports = mongoose.model('Location', locationSchema);
