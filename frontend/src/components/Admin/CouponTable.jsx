import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MetaData from '../Layouts/MetaData';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BackdropLoader from '../Layouts/BackdropLoader';
import { getCoupons, deleteCoupon, clearErrors } from '../../actions/couponAction';
import { DELETE_COUPON_RESET } from '../../constants/couponConstants';

const CouponTable = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState("");
    const [copyDialog, setCopyDialog] = useState(false);
    const [copiedCode, setCopiedCode] = useState("");

    const { coupons, error, loading } = useSelector((state) => state.coupons);
    const { isDeleted, error: deleteError } = useSelector((state) => state.coupon);

    useEffect(() => {
        dispatch(getCoupons());

        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }

        if (deleteError) {
            enqueueSnackbar(deleteError, { variant: "error" });
            dispatch(clearErrors());
        }

        if (isDeleted) {
            enqueueSnackbar("Coupon Deleted Successfully", { variant: "success" });
            dispatch({ type: DELETE_COUPON_RESET });
        }
    }, [dispatch, error, deleteError, isDeleted, enqueueSnackbar]);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCode(code);
            setCopyDialog(true);
        }).catch(() => {
            enqueueSnackbar("Failed to copy to clipboard", { variant: "error" });
        });
    };

    const deleteHandler = (id) => {
        dispatch(deleteCoupon(id));
        setOpen(false);
    };

    const columns = [
        {
            field: "code",
            headerName: "Coupon Code",
            minWidth: 180,
            flex: 0.7,
            renderCell: (params) => {
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{params.row.code}</span>
                        <button
                            onClick={() => handleCopyCode(params.row.code)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <ContentCopyIcon fontSize="small" />
                        </button>
                    </div>
                );
            },
        },
        {
            field: "discount",
            headerName: "Discount",
            minWidth: 150,
            flex: 0.5,
            renderCell: (params) => {
                return (
                    <span>
                        {params.row.type === 'Percentage'
                            ? `${params.row.value}% off`
                            : `₹{params.row.value} off`}
                    </span>
                );
            },
        },
        {
            field: "minPurchase",
            headerName: "Min. Purchase",
            minWidth: 150,
            flex: 0.5,
            renderCell: (params) => {
                return <span>₹{params.row.minPurchase}</span>;
            },
        },
        {
            field: "validUntil",
            headerName: "Valid Until",
            minWidth: 150,
            flex: 0.5,
            renderCell: (params) => {
                const date = new Date(params.row.validUntil);
                return <span>{date.toLocaleDateString()}</span>;
            },
        },
        {
            field: "isActive",
            headerName: "Status",
            minWidth: 120,
            flex: 0.4,
            renderCell: (params) => {
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${params.row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {params.row.isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            },
        },
        {
            field: "usage",
            headerName: "Usage",
            minWidth: 120,
            flex: 0.4,
            renderCell: (params) => {
                return <span>{params.row.usageCount} / {params.row.usageLimit}</span>;
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 120,
            flex: 0.3,
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <div className="flex items-center gap-3">
                        <Link to={`/admin/coupon/${params.row.id}`} className="text-blue-600 hover:bg-blue-100 p-1 rounded-full">
                            <EditIcon />
                        </Link>
                        <button onClick={() => { setDeleteId(params.row.id); setOpen(true); }} className="text-red-600 hover:bg-red-100 p-1 rounded-full">
                            <DeleteIcon />
                        </button>
                    </div>
                );
            },
        },
    ];

    const rows = [];
    coupons && coupons.forEach((coupon) => {
        rows.unshift({
            id: coupon._id,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minPurchase: coupon.minPurchase,
            maxDiscount: coupon.maxDiscount,
            validFrom: coupon.validFrom,
            validUntil: coupon.validUntil,
            isActive: coupon.isActive,
            usageLimit: coupon.usageLimit,
            usageCount: coupon.usageCount,
            description: coupon.description
        });
    });

    return (
        <>
            <MetaData title="Admin: All Coupons | Flipkart" />

            {loading && <BackdropLoader />}

            <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-medium">Coupon Codes</h2>
                    <Link to="/admin/coupon/new" className="py-2 px-4 bg-primary-blue text-white rounded-md flex items-center gap-1">
                        <AddIcon /> New Coupon
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md">
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        disableSelectionOnClick
                        autoHeight
                        className="bg-white"
                    />
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this coupon?</p>
                    <p className="text-red-500 text-sm mt-1">This action cannot be undone.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary">Cancel</Button>
                    <Button onClick={() => deleteHandler(deleteId)} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Copy Dialog */}
            <Dialog open={copyDialog} onClose={() => setCopyDialog(false)}>
                <DialogTitle>Coupon Code Copied</DialogTitle>
                <DialogContent>
                    <p>Coupon code has been copied to clipboard:</p>
                    <TextField
                        value={copiedCode}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        InputProps={{
                            readOnly: true,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <ContentCopyIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCopyDialog(false)} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CouponTable; 