import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import MetaData from '../Layouts/MetaData';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { clearErrors, deleteCategory, getCategories } from '../../actions/categoryAction';
import { DELETE_CATEGORY_RESET } from '../../constants/categoryConstants';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import BackdropLoader from '../Layouts/BackdropLoader';

const Categories = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState("");

    const { categories, error } = useSelector((state) => state.categories);
    const { loading, isDeleted, error: deleteError } = useSelector((state) => state.category);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (deleteError) {
            enqueueSnackbar(deleteError, { variant: "error" });
            dispatch(clearErrors());
        }
        if (isDeleted) {
            enqueueSnackbar("Category Deleted Successfully", { variant: "success" });
            dispatch({ type: DELETE_CATEGORY_RESET });
        }
        
        dispatch(getCategories());
    }, [dispatch, error, deleteError, isDeleted, enqueueSnackbar]);

    const deleteHandler = (id) => {
        setOpen(false);
        dispatch(deleteCategory(id));
    }

    const columns = [
        {
            field: "id",
            headerName: "Category ID",
            minWidth: 200,
            flex: 0.5,
            renderCell: (params) => {
                return (
                    <span>{params.row.id.substring(0, 8)}...</span>
                );
            },
        },
        {
            field: "name",
            headerName: "Name",
            minWidth: 200,
            flex: 0.7,
        },
        {
            field: "description",
            headerName: "Description",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => {
                return (
                    <span>{params.row.description?.substring(0, 100) || ""}...</span>
                );
            },
        },
        {
            field: "type",
            headerName: "Type",
            minWidth: 100,
            flex: 0.3,
        },
        {
            field: "image",
            headerName: "Image",
            minWidth: 100,
            flex: 0.4,
            renderCell: (params) => {
                return (
                    <div className="w-12 h-12 flex items-center justify-center">
                        <img src={params.row.image} alt={params.row.name} 
                            className="w-full h-full object-contain border rounded-lg" />
                    </div>
                );
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 150,
            flex: 0.3,
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <div className="flex items-center gap-3">
                        <Link to={`/admin/category/${params.row.id}`} className="text-blue-600 hover:bg-blue-100 p-1 rounded-full">
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

    categories && categories.forEach((category) => {
        rows.unshift({
            id: category._id,
            name: category.name,
            description: category.description,
            type: category.parent ? "Subcategory" : "Main Category",
            image: category.image?.url || "",
        });
    });

    return (
        <>
            <MetaData title="Admin Categories | Flipkart" />

            {loading && <BackdropLoader />}

            <div className="w-full px-2 py-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">All Categories</h2>
                    <Link to="/admin/category/new" className="py-2 px-4 bg-primary-blue text-white rounded-md flex items-center gap-1">
                        <AddIcon /> New Category
                    </Link>
                </div>
                <div className="bg-white shadow-md rounded-lg">
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        disableSelectionOnClick
                        autoHeight
                        className="bg-white"
                    />
                </div>

                <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="alert-dialog-title">
                    <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                    <DialogContent>
                        <p>Are you sure you want to delete this category?</p>
                        <p className="text-red-500 text-sm mt-1">Note: This action cannot be undone.</p>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)} color="primary">Cancel</Button>
                        <Button onClick={() => deleteHandler(deleteId)} color="error">Delete</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};

export default Categories; 