import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { clearErrors, createCategory, getMainCategories } from '../../actions/categoryAction';
import { NEW_CATEGORY_RESET } from '../../constants/categoryConstants';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';
import { FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';

const NewSubcategory = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const { loading, success, error } = useSelector((state) => state.newCategory);
    const { categories } = useSelector((state) => state.mainCategories);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parentId, setParentId] = useState("");
    const [image, setImage] = useState("");
    const [imagePreview, setImagePreview] = useState("");

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

    const newSubcategorySubmitHandler = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            enqueueSnackbar("Please enter subcategory name", { variant: "warning" });
            return;
        }
        if (!parentId) {
            enqueueSnackbar("Please select a parent category", { variant: "warning" });
            return;
        }
        if (!image) {
            enqueueSnackbar("Please select an image", { variant: "warning" });
            return;
        }

        const formData = {
            name,
            description,
            parent: parentId,
            image
        };

        dispatch(createCategory(formData));
    };

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (success) {
            enqueueSnackbar("Subcategory Created Successfully", { variant: "success" });
            dispatch({ type: NEW_CATEGORY_RESET });
            navigate("/admin/subcategories");
        }
        
        dispatch(getMainCategories());
    }, [dispatch, error, success, navigate, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Admin: New Subcategory | GlossyVibes" />
            {loading && <BackdropLoader />}

            <form onSubmit={newSubcategorySubmitHandler} encType="multipart/form-data" className="flex flex-col gap-4 bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-xl font-medium">Create New Subcategory</h2>

                <div className="flex flex-col gap-2">
                    <FormControl fullWidth required>
                        <InputLabel id="parent-category-label">Parent Category</InputLabel>
                        <Select
                            labelId="parent-category-label"
                            value={parentId}
                            label="Parent Category"
                            onChange={(e) => setParentId(e.target.value)}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Subcategory Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        fullWidth
                    />

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Icon Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            required
                        />
                        {imagePreview && (
                            <div className="w-24 h-24 rounded-lg border flex items-center justify-center">
                                <img
                                    src={imagePreview}
                                    alt="Category Preview"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        variant="contained"
                        type="submit"
                        disabled={loading}
                        className="py-2 px-6 rounded bg-primary-blue hover:bg-blue-600 text-white font-medium"
                    >
                        Create Subcategory
                    </Button>
                </div>
            </form>
        </>
    );
};

export default NewSubcategory; 