import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyCoupons, clearCouponError } from '../redux/couponSlice';
import MetaData from '../components/Layouts/MetaData';
import Loader from '../components/Layouts/Loader';
import { useSnackbar } from 'notistack';

import Sidebar from '../components/User/Sidebar';
import MinCategory from '../components/Layouts/MinCategory';

const MyCoupons = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { loading, error, myCoupons } = useSelector((state) => state.coupons);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        dispatch(getMyCoupons());
        return () => dispatch(clearCouponError());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearCouponError());
        }
    }, [error, dispatch, enqueueSnackbar]);

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        enqueueSnackbar(`Code ${code} copied!`, { variant: "success" });
    };

    const filteredCoupons = myCoupons.filter(coupon => {
        if (filter === 'All') return true;
        if (filter === 'Active') return !coupon.isUsed && !coupon.isExpired && new Date(coupon.expiresAt) > new Date();
        if (filter === 'Used') return coupon.isUsed;
        if (filter === 'Expired') return coupon.isExpired || (new Date(coupon.expiresAt) < new Date() && !coupon.isUsed);
        return true;
    });

    const getStatusBadge = (coupon) => {
        if (coupon.isUsed) return <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">Used</span>;
        if (coupon.isExpired || new Date(coupon.expiresAt) < new Date())
            return <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">Expired</span>;
        return <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">Active</span>;
    };

    return (
        <>
            <MetaData title={'My Coupons'} />
            <MinCategory />
            <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 sm:mt-24">
                <div className="flex flex-col lg:flex-row gap-4 mb-7">
                    <Sidebar activeTab={"coupons"} />

                    <div className="flex-1 overflow-hidden shadow bg-white p-4 sm:p-6 min-h-[70vh]">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">My Rewards</h1>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {['All', 'Active', 'Used', 'Expired'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-5 py-1.5 rounded-sm text-sm font-medium transition-all ${filter === f
                                        ? 'bg-primary-blue text-white shadow'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:text-primary-blue hover:border-primary-blue'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {loading ? <Loader /> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredCoupons.length === 0 ? (
                                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-sm border-2 border-dashed border-gray-200">
                                        <div className="text-5xl mb-4">🎟️</div>
                                        <h3 className="text-xl font-semibold text-gray-700">No {filter !== 'All' ? filter.toLowerCase() : ''} coupons found</h3>
                                        <p className="text-gray-500 mt-2">Keep shopping to earn more rewards!</p>
                                    </div>
                                ) : (
                                    filteredCoupons.map((coupon) => (
                                        <div key={coupon._id} className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${coupon.type === 'welcome' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {coupon.type} Reward
                                                    </span>
                                                    <h3 className="text-2xl font-bold mt-2 text-gray-900">₹{coupon.discountAmount} <span className="text-sm font-normal text-gray-500">OFF</span></h3>
                                                </div>
                                                {getStatusBadge(coupon)}
                                            </div>

                                            <div className="mt-4 p-3 bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-between group-hover:bg-gray-100 transition-colors">
                                                <span className="font-mono font-bold text-lg tracking-wider text-gray-800">{coupon.code}</span>
                                                <button
                                                    onClick={() => copyToClipboard(coupon.code)}
                                                    className="text-primary-blue hover:text-blue-700 text-xs font-bold uppercase"
                                                >
                                                    Copy
                                                </button>
                                            </div>

                                            <div className="mt-4 flex justify-between text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                                                <span>Issued: {new Date(coupon.issuedAt).toLocaleDateString()}</span>
                                                <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                                            </div>

                                            {/* Decorative cutouts */}
                                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white border border-gray-200 rounded-full transform -translate-y-1/2"></div>
                                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full transform -translate-y-1/2"></div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="mt-12 text-center text-xs text-gray-400">
                            <p>✨ Coupons from GlossyVibes Rewards Program</p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default MyCoupons;
