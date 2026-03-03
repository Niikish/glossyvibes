const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// GET /api/v1/admin/stats  — Aggregated analytics dashboard data
exports.getAdminStats = asyncErrorHandler(async (req, res, next) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfThisMonth = new Date(currentYear, now.getMonth(), 1);
    const startOfLastMonth = new Date(currentYear, now.getMonth() - 1, 1);

    // Run all aggregations in parallel for performance
    const [
        totalOrders,
        totalProducts,
        totalUsersCount,
        revenueAgg,
        monthlyRevenueAgg,
        ordersByStatusAgg,
        thisMonthOrders,
        lastMonthOrders,
        newUsersThisMonth,
        topProducts,
    ] = await Promise.all([
        // Total order count
        Order.countDocuments(),

        // Total product count
        Product.countDocuments(),

        // Total user count
        User.countDocuments(),

        // Total revenue across all orders
        Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]),

        // Monthly revenue for current year (12 months array)
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]),

        // Orders grouped by status
        Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        ]),

        // This month's total revenue
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfThisMonth } } },
            { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
        ]),

        // Last month's total revenue
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
                },
            },
            { $group: { _id: null, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
        ]),

        // New users registered this month
        User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),

        // Top 5 products by numOfReviews
        Product.find()
            .select('name images ratings numOfReviews price stock')
            .sort({ numOfReviews: -1 })
            .limit(5),
    ]);

    // Build the 12-month revenue array (fill missing months with 0)
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const monthData = monthlyRevenueAgg.find((m) => m._id === i + 1);
        return {
            month: i + 1,
            revenue: monthData ? monthData.revenue : 0,
            orders: monthData ? monthData.orders : 0,
        };
    });

    // Build ordersByStatus object
    const ordersByStatus = { Processing: 0, Shipped: 0, Delivered: 0 };
    ordersByStatusAgg.forEach((s) => {
        if (ordersByStatus.hasOwnProperty(s._id)) {
            ordersByStatus[s._id] = s.count;
        }
    });

    const totalRevenue = revenueAgg[0]?.total || 0;
    const thisMonthRevenue = thisMonthOrders[0]?.revenue || 0;
    const lastMonthRevenue = lastMonthOrders[0]?.revenue || 0;
    const revenueGrowth =
        lastMonthRevenue > 0
            ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
            : null;

    res.status(200).json({
        success: true,
        stats: {
            totalRevenue,
            totalOrders,
            totalProducts,
            totalUsers: totalUsersCount,
            thisMonthRevenue,
            lastMonthRevenue,
            revenueGrowth: revenueGrowth ? Number(revenueGrowth) : null,
            thisMonthOrders: thisMonthOrders[0]?.count || 0,
            newUsersThisMonth,
            monthlyRevenue,
            ordersByStatus,
            topProducts,
        },
    });
});
