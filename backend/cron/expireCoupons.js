const cron = require('node-cron');
const Coupon = require('../models/Coupon');

const scheduleExpiryCleanup = () => {
    // Run every day at midnight (00:00 AM)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Coupon Expiry Cleanup Job...');
        try {
            const result = await Coupon.updateMany(
                {
                    expiresAt: { $lt: new Date() },
                    isExpired: false
                },
                {
                    $set: { isExpired: true }
                }
            );
            console.log(`Expired ${result.modifiedCount} coupons.`);
        } catch (error) {
            console.error('Error in Expiry Cleanup Job:', error);
        }
    });
    console.log('Coupon Expiry Cron Scheduled.');
};

module.exports = scheduleExpiryCleanup;
