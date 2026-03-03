import { useEffect } from 'react';
import { Doughnut, Line, Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { getAdminProducts } from '../../actions/productAction';
import { useSelector, useDispatch } from 'react-redux';
import { getAllOrders } from '../../actions/orderAction';
import { getAllUsers } from '../../actions/userAction';
import { getAdminStats } from '../../actions/adminAction';
import { getMainCategories } from '../../actions/categoryAction';
import MetaData from '../Layouts/MetaData';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const MainData = () => {

    const dispatch = useDispatch();

    // FE-004 FIX: use optional chaining everywhere to prevent crash on first render
    const { products } = useSelector((state) => state.products);
    const { orders } = useSelector((state) => state.allOrders);
    const { users } = useSelector((state) => state.users);
    // FE-003 FIX: use real stats from the new /api/v1/admin/stats endpoint
    const { stats } = useSelector((state) => state.adminStats || {});
    // FE-003 FIX: real DB categories instead of hardcoded constants
    const { categories } = useSelector((state) => state.mainCategories || { categories: [] });

    let outOfStock = 0;
    products?.forEach((item) => {
        if (item.stock === 0) outOfStock += 1;
    });

    useEffect(() => {
        dispatch(getAdminProducts());
        dispatch(getAllOrders());
        dispatch(getAllUsers());
        dispatch(getAdminStats());
        dispatch(getMainCategories());
    }, [dispatch]);

    // FE-006 FIX: prefer server-aggregated totalRevenue from stats; fall back to client calc
    const totalAmount = stats?.totalRevenue ??
        (orders?.reduce((total, order) => total + order.totalPrice, 0) || 0);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    // FE-006 FIX: build chart from server monthly data when available, else client-side
    const buildMonthlyData = (year) => {
        if (stats?.monthlyRevenue && year === currentYear) {
            return stats.monthlyRevenue.map((m) => m.revenue);
        }
        return months.map((_, i) =>
            orders?.filter((od) =>
                new Date(od.createdAt).getMonth() === i &&
                new Date(od.createdAt).getFullYear() === year
            ).reduce((total, od) => total + od.totalPrice, 0) || 0
        );
    };

    const lineState = {
        labels: months,
        datasets: [
            {
                label: `Sales in ${currentYear - 1}`,
                borderColor: 'orange',
                backgroundColor: 'rgba(249,115,22,0.1)',
                tension: 0.4,
                data: buildMonthlyData(currentYear - 1),
            },
            {
                label: `Sales in ${currentYear}`,
                borderColor: '#4ade80',
                backgroundColor: 'rgba(74,222,128,0.1)',
                tension: 0.4,
                data: buildMonthlyData(currentYear),
            },
        ],
    };

    const statuses = ['Processing', 'Shipped', 'Delivered'];
    const pieState = {
        labels: statuses,
        datasets: [
            {
                backgroundColor: ['#9333ea', '#facc15', '#4ade80'],
                hoverBackgroundColor: ['#a855f7', '#fde047', '#86efac'],
                // FE-006 FIX: use server ordersByStatus when available
                data: statuses.map((status) =>
                    stats?.ordersByStatus?.[status] ??
                    (orders?.filter((item) => item.orderStatus === status).length || 0)
                ),
            },
        ],
    };

    // FE-004 FIX: guard products?.length
    const inStock = (products?.length || 0) - outOfStock;
    const doughnutState = {
        labels: ['Out of Stock', 'In Stock'],
        datasets: [
            {
                backgroundColor: ['#ef4444', '#22c55e'],
                hoverBackgroundColor: ['#dc2626', '#16a34a'],
                data: [outOfStock, inStock],
            },
        ],
    };

    // FE-003 & FE-005 FIX: use real DB category names and match by category._id or category.name
    const categoryNames = categories?.map((c) => c.name) || [];
    const barState = {
        labels: categoryNames,
        datasets: [
            {
                label: 'Products',
                borderColor: '#9333ea',
                backgroundColor: '#9333ea',
                hoverBackgroundColor: '#6b21a8',
                // FE-005 FIX: compare using category._id (since backend now populates both)
                data: categories?.map((cat) =>
                    products?.filter(
                        (item) =>
                            item.category?._id === cat._id ||
                            item.category === cat._id
                    ).length || 0
                ) || [],
            },
        ],
    };

    return (
        <>
            <MetaData title="Admin Dashboard | GlossyVibes" />

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex flex-col bg-purple-600 text-white gap-2 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-6">
                    <h4 className="text-gray-100 font-medium">Total Sales Amount</h4>
                    <h2 className="text-2xl font-bold">₹{totalAmount?.toLocaleString()}</h2>
                    {stats?.revenueGrowth !== null && stats?.revenueGrowth !== undefined && (
                        <span className={`text-xs font-medium ${stats.revenueGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {stats.revenueGrowth >= 0 ? '▲' : '▼'} {Math.abs(stats.revenueGrowth)}% vs last month
                        </span>
                    )}
                </div>
                <div className="flex flex-col bg-red-500 text-white gap-2 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-6">
                    <h4 className="text-gray-100 font-medium">Total Orders</h4>
                    <h2 className="text-2xl font-bold">{stats?.totalOrders ?? orders?.length ?? 0}</h2>
                    {stats?.thisMonthOrders !== undefined && (
                        <span className="text-xs text-red-100">{stats.thisMonthOrders} this month</span>
                    )}
                </div>
                <div className="flex flex-col bg-yellow-500 text-white gap-2 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-6">
                    <h4 className="text-gray-100 font-medium">Total Products</h4>
                    <h2 className="text-2xl font-bold">{stats?.totalProducts ?? products?.length ?? 0}</h2>
                    <span className="text-xs text-yellow-100">{outOfStock} out of stock</span>
                </div>
                <div className="flex flex-col bg-green-500 text-white gap-2 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 p-6">
                    <h4 className="text-gray-100 font-medium">Total Users</h4>
                    <h2 className="text-2xl font-bold">{stats?.totalUsers ?? users?.length ?? 0}</h2>
                    {stats?.newUsersThisMonth !== undefined && (
                        <span className="text-xs text-green-100">{stats.newUsersThisMonth} new this month</span>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 min-w-full">
                <div className="bg-white rounded-2xl h-auto w-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-4 sm:p-6">
                    <Line data={lineState} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>
                <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 text-center">
                    <span className="font-medium uppercase text-gray-800">Order Status</span>
                    <Pie data={pieState} />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 min-w-full mb-6 mt-4 sm:mt-6">
                <div className="bg-white rounded-2xl h-auto w-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-4 sm:p-6">
                    {categoryNames.length > 0 ? (
                        <Bar data={barState} options={{ responsive: true }} />
                    ) : (
                        <div className="flex items-center justify-center h-40 text-gray-400">Loading categories...</div>
                    )}
                </div>
                <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-6 text-center">
                    <span className="font-medium uppercase text-gray-800">Stock Status</span>
                    <Doughnut data={doughnutState} />
                </div>
            </div>
        </>
    );
};

export default MainData;
