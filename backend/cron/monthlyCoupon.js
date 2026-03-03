const cron = require('node-cron');
const User = require('../models/userModel');
const { generateMonthlyCoupon } = require('../utils/couponGenerator');

const scheduleMonthlyCoupons = () => {
    // Run every day at 00:01 AM
    cron.schedule('1 0 * * *', async () => {
        console.log('Running Monthly Loyalty Coupon Job...');
        try {
            const today = new Date();
            const currentDay = today.getDate();

            // Find users where today is their signup anniversary day
            const users = await User.find({
                $expr: {
                    $eq: [{ $dayOfMonth: "$createdAt" }, currentDay]
                }
            });

            console.log(`Found ${users.length} users with anniversary today.`);

            for (const user of users) {
                try {
                    await generateMonthlyCoupon(user);
                } catch (err) {
                    console.error(`Failed to issue monthly coupon for user ${user._id}:`, err);
                }
            }
        } catch (error) {
            console.error('Error in Monthly Coupon Job:', error);
        }
    });
    console.log('Monthly Loyalty Coupon Cron Scheduled.');
};

module.exports = scheduleMonthlyCoupons;
