import { useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { clearErrors, getAllBrands, deleteBrand } from '../../actions/brandAction';
import { Link } from 'react-router-dom';
import Actions from './Actions';
import MetaData from '../Layouts/MetaData';
import { DELETE_BRAND_RESET } from '../../constants/brandConstants';

const BrandTable = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { error, brands } = useSelector((state) => state.brands);
    const { error: deleteError, isDeleted } = useSelector((state) => state.brand);

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
            enqueueSnackbar("Brand Deleted Successfully", { variant: "success" });
            dispatch({ type: DELETE_BRAND_RESET });
        }
        dispatch(getAllBrands());
    }, [dispatch, error, deleteError, isDeleted, enqueueSnackbar]);

    const deleteBrandHandler = (id) => {
        dispatch(deleteBrand(id));
    }

    const columns = [
        {
            field: "id",
            headerName: "Brand ID",
            minWidth: 250,
            flex: 1,
        },
        {
            field: "name",
            headerName: "Brand Name",
            minWidth: 150,
            flex: 0.5,
        },
        {
            field: "description",
            headerName: "Description",
            minWidth: 200,
            flex: 0.8,
        },
        {
            field: "logo",
            headerName: "Logo",
            minWidth: 100,
            flex: 0.4,
            renderCell: (params) => {
                return (
                    <div className="h-10 w-10 flex items-center justify-center">
                        <img src={params.row.logo} alt={params.row.name} className="w-full h-full object-contain" />
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
                        editRoute={`/admin/brand/${params.id}`}
                        deleteHandler={() => deleteBrandHandler(params.id)}
                    />
                );
            },
        },
    ];

    const rows = [];

    brands && brands.forEach(brand => {
        rows.push({
            id: brand._id,
            name: brand.name,
            description: brand.description,
            logo: brand.logo.url,
            featured: brand.featured,
        });
    });

    return (
        <>
            <MetaData title="Admin Brands | Flipkart" />

            <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-medium uppercase">Brands</h1>
                    <Link to="/admin/new_brand" className="py-2 px-4 rounded shadow font-medium text-white bg-primary-blue hover:shadow-lg">
                        New Brand
                    </Link>
                </div>

                <div style={{ height: 420, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        disableSelectIconOnClick
                        sx={{
                            boxShadow: 0,
                            border: 0,
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default BrandTable; 