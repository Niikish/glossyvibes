import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { clearErrors, createBrand } from '../../actions/brandAction';
import { NEW_BRAND_RESET } from '../../constants/brandConstants';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';

const NewBrand = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const { loading, success, error } = useSelector((state) => state.newBrand);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [featured, setFeatured] = useState(false);
    const [logoPreview, setLogoPreview] = useState("");
    const [logo, setLogo] = useState("");

    const handleLogoChange = (e) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.readyState === 2) {
                setLogoPreview(reader.result);
                setLogo(reader.result);
            }
        };

        reader.readAsDataURL(e.target.files[0]);
    }

    const newBrandSubmitHandler = (e) => {
        e.preventDefault();

        if (!logo) {
            enqueueSnackbar("Please select a logo", { variant: "warning" });
            return;
        }

        const formData = {
            name,
            description,
            featured,
            logo,
        };

        // Debug log
        console.log('Submitting brand data:', formData);

        dispatch(createBrand(formData));
    }

    useEffect(() => {
        if (error) {
            // Debug log
            console.error('Error creating brand:', error);
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (success) {
            enqueueSnackbar("Brand Created Successfully", { variant: "success" });
            dispatch({ type: NEW_BRAND_RESET });
            navigate('/admin/brands');
        }
    }, [dispatch, error, success, navigate, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Admin: New Brand | GlossyVibes" />
            {loading && <BackdropLoader />}

            <form
                onSubmit={newBrandSubmitHandler}
                encType="multipart/form-data"
                className="flex flex-col sm:flex-row bg-white rounded-lg shadow p-4"
                id="mainform"
            >
                <div className="flex flex-col gap-3 m-2 sm:w-1/2">
                    <h2 className="font-medium">Create New Brand</h2>
                    <div>
                        <label className="font-medium" htmlFor="name">Brand Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter Brand Name"
                            className="mt-1 appearance-none block w-full px-3 h-9 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="font-medium" htmlFor="description">Brand Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter Brand Description"
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                            rows={5}
                            required
                        ></textarea>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="featured"
                            name="featured"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                            className="h-4 w-4"
                        />
                        <label className="font-medium" htmlFor="featured">Featured Brand</label>
                    </div>
                </div>

                <div className="flex flex-col gap-2 m-2 sm:w-1/2">
                    <h2 className="font-medium">Brand Logo</h2>
                    <div className="w-full flex flex-col gap-2">
                        <div className="flex items-center justify-center h-40 w-40 mx-auto border rounded-lg">
                            {logoPreview ? (
                                <img 
                                    src={logoPreview} 
                                    alt="Brand Logo" 
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <p className="text-gray-400 text-sm text-center">Logo Preview</p>
                            )}
                        </div>
                        <label className="rounded font-medium bg-gray-400 text-center cursor-pointer text-white p-2 shadow hover:shadow-lg my-2">
                            <input
                                type="file"
                                name="logo"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                            Choose Logo
                        </label>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-primary-pink w-1/2 p-2 text-white font-medium rounded shadow hover:shadow-lg"
                        >
                            Create
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};

export default NewBrand; 