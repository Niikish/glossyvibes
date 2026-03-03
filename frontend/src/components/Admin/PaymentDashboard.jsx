import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPaymentStats, clearErrors } from '../../actions/adminAction';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import Sidebar from './Sidebar/Sidebar';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const PaymentDashboard = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { loading, error, stats, timeSeriesData } = useSelector((state) => state.paymentAnalytics);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: 'error' });
            dispatch(clearErrors());
        }
        dispatch(getPaymentStats());
    }, [dispatch, error, enqueueSnackbar]);

    const lineState = {
        labels: timeSeriesData.map(data => new Date(data.date).toLocaleDateString()),
        datasets: [
            {
                label: "Revenue",
                borderColor: "#8b5cf6",
                backgroundColor: "#8b5cf6",
                data: timeSeriesData.map(data => data.totalRevenue),
            },
            {
                label: "Payments",
                borderColor: "#10b981",
                backgroundColor: "#10b981",
                data: timeSeriesData.map(data => data.totalPayments),
            }
        ],
    };

    return (
        <>
            <MetaData title="Admin Payment Analytics" />
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Payment Analytics Dashboard</h1>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 font-roboto">
                            <p className="text-sm text-gray-500 uppercase font-medium">Total Revenue</p>
                            <h2 className="text-2xl font-bold text-gray-800 mt-1">₹{stats.totalRevenue?.toLocaleString()}</h2>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 font-roboto">
                            <p className="text-sm text-gray-500 uppercase font-medium">Total Orders</p>
                            <h2 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders}</h2>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 font-roboto">
                            <p className="text-sm text-gray-500 uppercase font-medium">UPI / Razorpay</p>
                            <h2 className="text-2xl font-bold text-gray-800 mt-1">{stats.upiOrders}</h2>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 font-roboto">
                            <p className="text-sm text-gray-500 uppercase font-medium">Refunds</p>
                            <h2 className="text-2xl font-bold text-red-600 mt-1">{stats.refundedOrders}</h2>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-96">
                        <h3 className="text-lg font-medium text-gray-700 mb-6">Revenue & Payment Trends (Last 30 Days)</h3>
                        <Line data={lineState} options={{ maintainAspectRatio: false }} />
                    </div>
                </>
            )}
        </>
    );
};

export default PaymentDashboard;
