import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import ImageIcon from '@mui/icons-material/Image';
import { clearErrors, getCategoryDetails, getMainCategories, updateCategory } from '../../actions/categoryAction';
import { UPDATE_CATEGORY_RESET } from '../../constants/categoryConstants';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

const UpdateCategory = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const params = useParams();

    const { loading: categoryLoading, category, error: categoryError } = useSelector((state) => state.categoryDetails);
    const { loading, isUpdated, error } = useSelector((state) => state.category);
    const { categories } = useSelector((state) => state.mainCategories);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parentCategory, setParentCategory] = useState("");
    const [image, setImage] = useState("");
    const [imagePreview, setImagePreview] = useState("");

    const categoryId = params.id;

    useEffect(() => {
        if (category && category._id !== categoryId) {
            dispatch(getCategoryDetails(categoryId));
        } else {
            setName(category.name || "");
            setDescription(category.description || "");
            setParentCategory(category.parent || "");
            if (category.image) {
                setImagePreview(category.image.url || "");
            }
        }

        if (categoryError) {
            enqueueSnackbar(categoryError, { variant: "error" });
            dispatch(clearErrors());
        }

        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }

        if (isUpdated) {
            enqueueSnackbar("Category Updated Successfully", { variant: "success" });
            dispatch({ type: UPDATE_CATEGORY_RESET });
            navigate("/admin/categories");
        }

        dispatch(getMainCategories());
    }, [dispatch, categoryError, error, isUpdated, category, categoryId, navigate, enqueueSnackbar]);

    const handleImageChange = (e) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.readyState === 2) {
                setImagePreview(reader.result);
                setImage(reader.result);
            }
        };

        reader.readAsDataURL(e.target.files[0]);
    };

    const updateCategorySubmitHandler = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            enqueueSnackbar("Please enter category name", { variant: "warning" });
            return;
        }

        if (!description.trim()) {
            enqueueSnackbar("Please enter category description", { variant: "warning" });
            return;
        }

        const categoryData = {
            name,
            description
        };

        if (parentCategory) {
            categoryData.parent = parentCategory;
        }

        if (image) {
            categoryData.image = image;
        }

        dispatch(updateCategory(categoryId, categoryData));
    };

    return (
        <>
            <MetaData title="Admin: Update Category | Flipkart" />

            {(loading || categoryLoading) && <BackdropLoader />}
            
            <div className="w-full px-2 py-4 overflow-y-auto">
                    <form
                        onSubmit={updateCategorySubmitHandler}
                        encType="multipart/form-data"
                    className="flex flex-col sm:flex-row bg-white rounded-lg shadow p-4"
                        id="mainform"
                    >
                        <div className="flex flex-col gap-3 m-2 sm:w-1/2">
                                        <TextField
                            label="Name"
                                            variant="outlined"
                                            size="small"
                                            required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                        />
                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                                    required
                            variant="outlined"
                            size="small"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                        />
                        
                        <div className="flex flex-col gap-2">
                            <FormControl fullWidth size="small">
                                <InputLabel id="parent-category-select">Parent Category</InputLabel>
                                <Select
                                    labelId="parent-category-select"
                                    id="parent-category"
                                    value={parentCategory}
                                    label="Parent Category"
                                    onChange={(e) => setParentCategory(e.target.value)}
                                >
                                    <MenuItem value="">
                                        <em>None (Main Category)</em>
                                    </MenuItem>
                                    {categories && categories.map((cat) => (
                                        // Don't show current category as parent option (to prevent circular reference)
                                        cat._id !== categoryId && (
                                            <MenuItem key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </MenuItem>
                                        )
                                    ))}
                                </Select>
                            </FormControl>
                                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="font-medium">Category Image</p>
                            <div className="flex gap-4 items-center">
                                <div className="w-24 h-24 flex items-center justify-center border rounded-lg">
                                    {!imagePreview ? (
                                        <ImageIcon />
                                    ) : (
                                        <img
                                            draggable="false"
                                            src={imagePreview}
                                            alt="Category"
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                </div>
                                <label className="rounded font-medium bg-gray-400 text-center cursor-pointer text-white py-2 px-2.5 shadow hover:shadow-lg">
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    Choose New Image
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <input
                                form="mainform"
                                type="submit"
                                className="bg-primary-orange uppercase w-1/3 p-3 text-white font-medium rounded shadow hover:shadow-lg cursor-pointer"
                                value="Update"
                            />
                        </div>
                    </div>
                    </form>
            </div>
        </>
    );
};

export default UpdateCategory; 