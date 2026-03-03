import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import ImageIcon from '@mui/icons-material/Image';
import { clearErrors, createCategory, getMainCategories } from '../../actions/categoryAction';
import { NEW_CATEGORY_RESET } from '../../constants/categoryConstants';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

const NewCategory = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const { loading, success, error } = useSelector((state) => state.newCategory);
    const { categories } = useSelector((state) => state.mainCategories);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parentCategory, setParentCategory] = useState("");
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

    const newCategorySubmitHandler = (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            enqueueSnackbar("Please enter category name", { variant: "warning" });
            return;
        }
        
        if (!description.trim()) {
            enqueueSnackbar("Please enter category description", { variant: "warning" });
            return;
        }

        if (!image) {
            enqueueSnackbar("Please select an image", { variant: "warning" });
            return;
        }

        const categoryData = {
            name,
            description,
            image
        };

        if (parentCategory) {
            categoryData.parent = parentCategory;
        }

        dispatch(createCategory(categoryData));
    };

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (success) {
            enqueueSnackbar("Category Created Successfully", { variant: "success" });
            dispatch({ type: NEW_CATEGORY_RESET });
            navigate("/admin/categories");
        }

        dispatch(getMainCategories());
    }, [dispatch, error, success, navigate, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Admin: Create Category | Flipkart" />

            {loading && <BackdropLoader />}

            <div className="w-full px-2 py-4 overflow-y-auto">
                <form
                    onSubmit={newCategorySubmitHandler}
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
                                    {categories && categories.map((category) => (
                                        <MenuItem key={category._id} value={category._id}>
                                            {category.name}
                                        </MenuItem>
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
                                    Choose Image
                                </label>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <input
                                form="mainform"
                                type="submit"
                                className="bg-primary-blue uppercase w-1/3 p-3 text-white font-medium rounded shadow hover:shadow-lg cursor-pointer"
                                value="Submit"
                            />
                        </div>
                        </div>
                    </form>
            </div>
        </>
    );
};

export default NewCategory;