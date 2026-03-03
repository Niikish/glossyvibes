import React, { useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { getSettlements, clearErrors } from '../../actions/adminAction';
import MetaData from '../Layouts/MetaData';
import Sidebar from './Sidebar/Sidebar';

const SettlementTable = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { loading, error, settlements } = useSelector((state) => state.settlements);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        dispatch(getSettlements());
    }, [dispatch, error, enqueueSnackbar]);

    const columns = [
        {
            field: "settlementId",
            headerName: "Settlement ID",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "utr",
            headerName: "UTR / Reference",
            minWidth: 200,
            flex: 1,
        },
        {
            field: "amount",
            headerName: "Amount",
            type: "number",
            minWidth: 150,
            flex: 0.5,
            renderCell: (params) => `₹{params.row.amount.toLocaleString()}`,
        },
        {
            field: "fees",
            headerName: "Fees (incl. Tax)",
            type: "number",
            minWidth: 150,
            flex: 0.5,
            renderCell: (params) => `₹{(params.row.fees + params.row.tax).toLocaleString()}`,
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
            flex: 0.3,
            renderCell: (params) => (
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${params.row.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {params.row.status}
                </span>
            ),
        },
        {
            field: "date",
            headerName: "Settled At",
            minWidth: 150,
            flex: 0.5,
        },
    ];

    const rows = settlements.map((item) => ({
        id: item._id,
        settlementId: item.settlementId,
        utr: item.utr || "N/A",
        amount: item.amount,
        fees: item.fees,
        tax: item.tax,
        status: item.status,
        date: new Date(item.settledAt).toLocaleDateString(),
    }));

    return (
        <>
            <MetaData title="Razorpay Settlements | Admin" />
            <h1 className="text-2xl font-semibold text-gray-800 mb-4 uppercase">Bank Settlements</h1>
            <div className="bg-white rounded-xl shadow-lg w-full" style={{ height: 600 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    loading={loading}
                    disableSelectIconOnClick
                    sx={{
                        boxShadow: 0,
                        border: 0,
                    }}
                />
            </div>
        </>
    );
};

export default SettlementTable;
