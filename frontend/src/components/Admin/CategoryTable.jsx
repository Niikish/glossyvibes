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
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Chip from '@mui/material/Chip';
import { Tooltip, ButtonGroup, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CategoryTable = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { categories, error, loading } = useSelector((state) => state.categories);
    const { isDeleted, error: deleteError } = useSelector((state) => state.category);
    const [organizedRows, setOrganizedRows] = useState([]);
    // View mode: "all", "main", "sub"
    const [viewMode, setViewMode] = useState("all");
    // Delete confirmation dialog state
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [hasChildrenError, setHasChildrenError] = useState(false);
    // Add state variables for icon preview at the top of component
    const [previewIcon, setPreviewIcon] = useState(null);
    const [openIconPreview, setOpenIconPreview] = useState(false);

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
    }, [dispatch, error, isDeleted, deleteError, enqueueSnackbar]);

    // Organize categories into hierarchy
    useEffect(() => {
        if (categories) {
            // Create a map of categories by ID for quick lookup
            const categoryMap = {};
            categories.forEach(category => {
                categoryMap[category._id] = category;
            });

            // Identify parent categories (those with no parent)
            const parentCategories = categories.filter(category => !category.parent);
            
            // Initialize rows array
            const rows = [];
            
            // Add parent categories first
            parentCategories.forEach(category => {
                rows.push({
                    id: category._id,
                    displayId: category.displayId || "N/A",
                    name: category.name,
                    description: category.description,
                    icon: category.icon?.url || null,
                    parent: "None",
                    featured: category.featured,
                    isParent: true,
                    level: 0,
                });
                
                // Find children categories for this parent
                const children = categories.filter(child => 
                    child.parent && child.parent._id === category._id
                );
                
                // Add children with indentation
                children.forEach(child => {
                    rows.push({
                        id: child._id,
                        displayId: child.displayId || "N/A",
                        name: child.name,
                        description: child.description,
                        icon: child.icon?.url || null,
                        parent: category.name,
                        parentId: category._id,
                        featured: child.featured,
                        isParent: false,
                        level: 1,
                    });
                });
            });
            
            // Filter rows based on view mode
            let filteredRows = rows;
            if (viewMode === "main") {
                filteredRows = rows.filter(row => row.isParent);
            } else if (viewMode === "sub") {
                filteredRows = rows.filter(row => !row.isParent);
            }
            
            setOrganizedRows(filteredRows);
        }
    }, [categories, viewMode]);

    // Check if a category has children
    const categoryHasChildren = (categoryId) => {
        return categories.some(category => 
            category.parent && category.parent._id === categoryId
        );
    };

    // Handle delete button click
    const handleDeleteClick = (id) => {
        setCategoryToDelete(id);
        
        // Check if category has children
        if (categoryHasChildren(id)) {
            setHasChildrenError(true);
        } else {
            setHasChildrenError(false);
        }
        
        setOpenDeleteDialog(true);
    };

    // Close dialog
    const handleCloseDialog = () => {
        setOpenDeleteDialog(false);
        setCategoryToDelete(null);
        setHasChildrenError(false);
    };

    // Proceed with deletion if confirmed
    const confirmDelete = () => {
        if (!hasChildrenError && categoryToDelete) {
            dispatch(deleteCategory(categoryToDelete));
            handleCloseDialog();
        }
    };

    const columns = [
        {
            field: "id",
            headerName: "Category ID",
            minWidth: 100,
            flex: 0.5,
            hide: true,
        },
        {
            field: "displayId",
            headerName: "ID",
            minWidth: 80,
            flex: 0.3,
            renderCell: (params) => {
                return (
                    <span className="font-medium">
                        {params.row.displayId ? params.row.displayId : "N/A"}
                    </span>
                );
            },
        },
        {
            field: "name",
            headerName: "Category Name",
            minWidth: 200,
            flex: 0.8,
            renderCell: (params) => {
                return (
                    <div className="flex items-center">
                        {params.row.level > 0 && (
                            <ArrowRightIcon className="text-gray-500 mr-1" />
                        )}
                        <span className={`${params.row.isParent ? 'font-semibold' : ''}`}>
                            {params.row.name}
                        </span>
                        {params.row.isParent && (
                            <Chip 
                                label="Parent" 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                                className="ml-2"
                                sx={{ height: '20px' }}
                            />
                        )}
                    </div>
                );
            },
        },
        {
            field: "parent",
            headerName: "Parent Category",
            minWidth: 150,
            flex: 0.5,
            renderCell: (params) => {
                return (
                    <div>
                        {params.row.parent !== "None" ? (
                            <Tooltip title="Parent Category">
                                <Link to={`/admin/category/${params.row.parentId}`} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                                    {params.row.parent}
                                </Link>
                            </Tooltip>
                        ) : (
                            <span className="text-gray-500">None</span>
                        )}
                    </div>
                );
            },
        },
        {
            field: "description",
            headerName: "Description",
            minWidth: 200,
            flex: 0.8,
        },
        {
            field: "icon",
            headerName: "Icon",
            minWidth: 100,
            flex: 0.4,
            renderCell: (params) => {
                return (
                    <div className="h-10 w-10 flex items-center justify-center">
                        {params.row.icon ? (
                            <Tooltip 
                                title="View larger icon" 
                                arrow
                                placement="top"
                            >
                                <div 
                                    className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200 hover:border-primary-blue cursor-pointer transition-all duration-200 p-1"
                                    onClick={() => {
                                        setPreviewIcon({
                                            url: params.row.icon,
                                            name: params.row.name
                                        });
                                        setOpenIconPreview(true);
                                    }}
                                >
                                    <img 
                                        src={params.row.icon} 
                                        alt={params.row.name} 
                                        className="w-full h-full object-contain" 
                                    />
                                </div>
                            </Tooltip>
                        ) : (
                            <span className="text-gray-400 text-xs text-center">No icon</span>
                        )}
                    </div>
                );
            },
        },
        {
            field: "featured",
            headerName: "Featured",
            minWidth: 100,
            flex: 0.4,
            renderCell: (params) => {
                return (
                    <div className="text-center">
                        {params.row.featured ? 
                            <span className="text-green-600 font-medium">Yes</span> : 
                            <span className="text-red-600 font-medium">No</span>}
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
                        editRoute={`/admin/category/${params.id}`}
                        deleteHandler={() => handleDeleteClick(params.id)}
                    />
                );
            },
        },
    ];

    return (
        <>
            <MetaData title="Admin Categories | Flipkart" />
            {loading && <BackdropLoader />}

            <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-medium uppercase">Categories</h1>
                    <div className="flex gap-2 items-center">
                        <Link to="/admin/new_category" className="py-2 px-4 rounded shadow font-medium text-white bg-primary-blue hover:shadow-lg">
                            New Category
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="mb-4 flex flex-col sm:flex-row justify-between">
                        <div>
                            <h2 className="text-sm text-gray-600">Category Management</h2>
                            <p className="text-xs text-gray-500">Manage your store's product categories. Filter by category type using the buttons below.</p>
                        </div>
                        <div className="mt-3 sm:mt-0">
                            <ButtonGroup variant="outlined" aria-label="category view mode">
                                <Button 
                                    onClick={() => setViewMode("all")}
                                    variant={viewMode === "all" ? "contained" : "outlined"}
                                >
                                    All Categories
                                </Button>
                                <Button 
                                    onClick={() => setViewMode("main")}
                                    variant={viewMode === "main" ? "contained" : "outlined"}
                                    color="primary"
                                >
                                    Main Categories
                                </Button>
                                <Button 
                                    onClick={() => setViewMode("sub")}
                                    variant={viewMode === "sub" ? "contained" : "outlined"}
                                    color="success"
                                >
                                    Subcategories
                                </Button>
                            </ButtonGroup>
                        </div>
                    </div>
                    
                    {viewMode === "main" && (
                        <div className="bg-blue-50 p-2 mb-4 rounded-md">
                            <p className="text-sm text-blue-700">Showing main categories only. These are top-level categories that can have subcategories.</p>
                        </div>
                    )}
                    
                    {viewMode === "sub" && (
                        <div className="bg-green-50 p-2 mb-4 rounded-md">
                            <p className="text-sm text-green-700">Showing subcategories only. These belong to parent categories.</p>
                        </div>
                    )}
                    
                    <div style={{ height: 420, width: '100%' }}>
                        {organizedRows.length > 0 ? (
                            <DataGrid
                                rows={organizedRows}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[10, 25, 50]}
                                disableSelectIconOnClick
                                getRowClassName={(params) => 
                                    params.row.isParent ? "bg-gray-50" : ""
                                }
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
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">
                                    {viewMode === "all" 
                                        ? "No categories found" 
                                        : viewMode === "main" 
                                            ? "No main categories found" 
                                            : "No subcategories found"
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                            {organizedRows.length} {viewMode === "all" 
                                ? "categories" 
                                : viewMode === "main" 
                                    ? "main categories" 
                                    : "subcategories"
                            } total
                        </div>
                        <div className="flex gap-2">
                            <Link to="/admin/new_category" className="py-1 px-3 rounded text-sm font-medium text-white bg-primary-blue hover:bg-blue-600">
                                Add New Category
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {hasChildrenError ? "Cannot Delete Category" : "Confirm Category Deletion"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {hasChildrenError ? (
                            <div className="text-red-600">
                                This category contains subcategories. Please remove all subcategories first before deleting this category.
                            </div>
                        ) : (
                            "Are you sure you want to delete this category? This action cannot be undone."
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        {hasChildrenError ? "OK" : "Cancel"}
                    </Button>
                    {!hasChildrenError && (
                        <Button onClick={confirmDelete} color="error" autoFocus>
                            Delete
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Icon Preview Dialog */}
            <Dialog
                open={openIconPreview}
                onClose={() => setOpenIconPreview(false)}
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        padding: '12px',
                    }
                }}
            >
                <DialogTitle>
                    <div className="flex justify-between items-center">
                        <Typography variant="h6">
                            Category Icon: {previewIcon?.name}
                        </Typography>
                        <IconButton 
                            edge="end" 
                            color="inherit" 
                            onClick={() => setOpenIconPreview(false)}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent dividers>
                    <div className="w-64 h-64 mx-auto flex items-center justify-center p-4">
                        {previewIcon?.url ? (
                            <img 
                                src={previewIcon.url} 
                                alt={previewIcon.name} 
                                className="max-w-full max-h-full object-contain shadow-sm" 
                            />
                        ) : (
                            <Typography variant="body1" color="textSecondary">
                                No icon available
                            </Typography>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CategoryTable; 