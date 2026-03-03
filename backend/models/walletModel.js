const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Wallet balance cannot be negative']
    },
    transactions: [
        {
            type: {
                type: String,
                enum: ['Credit', 'Debit'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            reason: {
                type: String,
                required: true
            },
            referenceId: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
