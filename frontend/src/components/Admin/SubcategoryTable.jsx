import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import { clearErrors, getCategories, deleteCategory } from '../../actions/categoryAction';
import { DELETE_CATEGORY_RESET } from '../../constants/categoryConstants';
import Actions from './Actions';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SubcategoryTable = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { categories, error, loading } = useSelector((state) => state.categories);
    const { isDeleted, error: deleteError } = useSelector((state) => state.category);

    const [filteredRows, setFilteredRows] = useState([]);
    const [selectedParent, setSelectedParent] = useState('all');

    // Get only parent categories for filter dropdown
    const parentCategories = categories?.filter(cat => !cat.parent) || [];

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
            enqueueSnackbar("Subcategory Deleted Successfully", { variant: "success" });
            dispatch({ type: DELETE_CATEGORY_RESET });
        }
        dispatch(getCategories());
    }, [dispatch, error, deleteError, isDeleted, enqueueSnackbar]);

    useEffect(() => {
        const subcategories = categories?.filter(cat => cat.parent) || [];
        // Filter subcategories based on selected parent
        if (selectedParent === 'all') {
            setFilteredRows(subcategories.map(subcat => ({
                id: subcat._id,
                name: subcat.name,
                parentName: subcat.parent?.name || 'Unknown',
                parentId: subcat.parent?._id,
                description: subcat.description,
                image: subcat.image?.url
            })));
        } else {
            setFilteredRows(subcategories
                .filter(subcat => subcat.parent?._id === selectedParent)
                .map(subcat => ({
                    id: subcat._id,
                    name: subcat.name,
                    parentName: subcat.parent?.name || 'Unknown',
                    parentId: subcat.parent?._id,
                    description: subcat.description,
                    image: subcat.image?.url
                })));
        }
    }, [categories, selectedParent]);

    const handleDeleteSubcategory = (id) => {
        dispatch(deleteCategory(id));
    };

    const columns = [
        {
            field: "id",
            headerName: "ID",
            minWidth: 100,
            flex: 0.3,
        },
        {
            field: "name",
            headerName: "Subcategory Name",
            minWidth: 200,
            flex: 0.8,
        },
        {
            field: "parentName",
            headerName: "Parent Category",
            minWidth: 200,
            flex: 0.8,
        },
        {
            field: "description",
            headerName: "Description",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => {
                return params.row.description?.substring(0, 100) || "No description";
            }
        },
        {
            field: "image",
            headerName: "Icon",
            minWidth: 100,
            flex: 0.4,
            renderCell: (params) => {
                return (
                    <div className="h-10 w-10 flex items-center justify-center">
                        {params.row.image ? (
                            <img
                                src={params.row.image}
                                alt={params.row.name}
                                className="w-full h-full object-contain rounded-full border-2 border-gray-200"
                            />
                        ) : (
                            <span className="text-gray-400 text-xs text-center">No icon</span>
                        )}
                    </div>
                );
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 100,
            flex: 0.3,
            type: 'number',
            sortable: false,
            renderCell: (params) => {
                return (
                    <Actions
                        editRoute={`category/${params.id}`}
                        deleteHandler={() => handleDeleteSubcategory(params.id)}
                    />
                );
            },
        },
    ];

    return (
        <>
            <MetaData title="Admin Subcategories | GlossyVibes" />
            {loading && <BackdropLoader />}

            <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-medium uppercase">Subcategories</h1>
                    <Link to="/admin/subcategory/new" className="py-2 px-4 rounded shadow font-medium text-white bg-primary-blue hover:shadow-lg">
                        New Subcategory
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex justify-between items-center pb-4">
                        <div>
                            <h2 className="text-xl font-medium">Subcategory Management</h2>
                            <p className="text-sm text-gray-500">Manage and organize your store's subcategories</p>
                        </div>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel id="parent-category-filter">Filter by Parent</InputLabel>
                            <Select
                                labelId="parent-category-filter"
                                value={selectedParent}
                                label="Filter by Parent"
                                onChange={(e) => setSelectedParent(e.target.value)}
                            >
                                <MenuItem value="all">All Parents</MenuItem>
                                {parentCategories.map((category) => (
                                    <MenuItem key={category._id} value={category._id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <div style={{ height: 420, width: '100%' }}>
                        <DataGrid
                            rows={filteredRows}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                            disableSelectIconOnClick
                            sx={{
                                boxShadow: 0,
                                border: 0,
                                "& .MuiDataGrid-row:hover": {
                                    backgroundColor: "rgba(245, 245, 245, 1)",
                                },
                                "& .MuiDataGrid-columnHeaders": {
                                    backgroundColor: "#f9fafb",
                                    borderBottom: "1px solid #e5e7eb",
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubcategoryTable; 