const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
    settlementId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['created', 'processed', 'failed'],
        default: 'created'
    },
    fees: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    utr: {
        type: String,
    },
    settledAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settlement', settlementSchema);
