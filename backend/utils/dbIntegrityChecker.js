const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const cron = require('node-cron');
const ErrorHandler = require('./errorHandler');

// Function to run integrity checks
const runDatabaseIntegrityChecks = async () => {
    console.log(`[${new Date().toISOString()}] Started Database Integrity Checks`);
    const errors = [];

    try {
        // 1. Check: No unpaid order older than 30 min (Assuming status 'Processing' means wait for payment if no paymentInfo or processing)
        // Adjust logic based on exact app flow. If an order lacks payment ID but is old, discard or flag.
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const unpaidOldOrders = await Order.find({
            createdAt: { $lt: thirtyMinsAgo },
            'paymentInfo.status': { $ne: 'succeeded' }
        });
        if (unpaidOldOrders.length > 0) {
            errors.push(`Found ${unpaidOldOrders.length} unpaid orders older than 30 mins.`);
            // Optional: Auto-cancel them
            // await Order.updateMany({ _id: { $in: unpaidOldOrders.map(o => o._id) } }, { orderStatus: 'Cancelled' });
        }

        // 2. Check: No duplicate razorpay_payment_id
        const duplicatePayments = await Order.aggregate([
            { $match: { 'paymentInfo.id': { $ne: null } } },
            { $group: { _id: '$paymentInfo.id', count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        if (duplicatePayments.length > 0) {
            errors.push(`CRITICAL: Found ${duplicatePayments.length} duplicate Razorpay payment IDs.`);
        }

        // 3. Check: No order without user reference
        const orphanedOrders = await Order.find({ user: null });
        if (orphanedOrders.length > 0) {
            errors.push(`Found ${orphanedOrders.length} orders lacking a user reference.`);
        }

        // 4. Check: No order with negative totalPrice
        const negativeOrders = await Order.find({ totalPrice: { $lt: 0 } });
        if (negativeOrders.length > 0) {
            errors.push(`CRITICAL: Found ${negativeOrders.length} orders with negative total price.`);
        }

        // 5. Check: No product without category
        const statelessProducts = await Product.find({ category: { $exists: false } });
        // Or if category is an empty string
        const emptyCatProducts = await Product.find({ category: "" });
        if (statelessProducts.length > 0 || emptyCatProducts.length > 0) {
            errors.push(`Found ${statelessProducts.length + emptyCatProducts.length} products with missing categories.`);
        }

        // 6. Check: No broken foreign references (Products referencing users that don't exist)
        // Not all DBs strictly enforce this if Mongoose refs are used without physical DB constraints.
        const productsUsers = await Product.distinct('user');
        const validUsers = await User.find({ _id: { $in: productsUsers } }).select('_id');
        const validUserIds = validUsers.map(u => u._id.toString());
        const invalidReferences = productsUsers.filter(pu => pu && !validUserIds.includes(pu.toString()));
        if (invalidReferences.length > 0) {
            errors.push(`Found product documents referencing non-existent users.`);
        }

        if (errors.length > 0) {
            console.error(`[Integrity Failure] Issues detected:\n`, errors.join('\n'));
            // In a real system, you might trigger an email/Slack alert here
        } else {
            console.log(`[Integrity Success] All database checks passed.`);
        }

    } catch (error) {
        console.error(`[Integrity Error] DB Check failed to run:`, error.message);
    }
};

// Schedule to run nightly at 2:00 AM
const scheduleIntegrityCron = () => {
    cron.schedule('0 2 * * *', () => {
        runDatabaseIntegrityChecks();
    });
    console.log('Database Integrity Cron Scheduled.');
};

module.exports = {
    runDatabaseIntegrityChecks,
    scheduleIntegrityCron
};
