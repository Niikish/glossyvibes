import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuItem from '@mui/material/MenuItem';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { NEW_PRODUCT_RESET } from '../../constants/productConstants';
import { createProduct, clearErrors } from '../../actions/productAction';
import MetaData from '../Layouts/MetaData';
import BackdropLoader from '../Layouts/BackdropLoader';
import { getMainCategories, getSubCategories } from '../../actions/categoryAction';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { getAllBrands } from '../../actions/brandAction';

const NewProduct = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const { loading, success, error } = useSelector((state) => state.newProduct);
    const { categories: mainCategories } = useSelector((state) => state.mainCategories);
    const { categories: subCategories } = useSelector((state) => state.subCategories);
    const { brands } = useSelector((state) => state.brands);

    const [highlights, setHighlights] = useState([]);
    const [highlightInput, setHighlightInput] = useState('');
    const [specs, setSpecs] = useState([]);
    const [specsInput, setSpecsInput] = useState({ title: '', description: '' });

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [cuttedPrice, setCuttedPrice] = useState(0);
    const [category, setCategory] = useState('');
    const [stock, setStock] = useState(0);
    const [brand, setBrand] = useState('');
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [mainCategory, setMainCategory] = useState('');

    const handleSpecsChange = (e) => {
        setSpecsInput({ ...specsInput, [e.target.name]: e.target.value });
    };

    const addSpecs = () => {
        // FE-001 FIX: was checking specsInput.title twice — now correctly checks both title AND description
        if (!specsInput.title.trim() || !specsInput.description.trim()) return;
        setSpecs([...specs, specsInput]);
        setSpecsInput({ title: '', description: '' });
    };

    const addHighlight = () => {
        if (!highlightInput.trim()) return;
        setHighlights([...highlights, highlightInput]);
        setHighlightInput('');
    };

    const deleteHighlight = (index) => setHighlights(highlights.filter((_, i) => i !== index));
    const deleteSpec = (index) => setSpecs(specs.filter((_, i) => i !== index));

    const handleProductImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages([]);
        setImagesPreview([]);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview((old) => [...old, reader.result]);
                    setImages((old) => [...old, reader.result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const newProductSubmitHandler = (e) => {
        e.preventDefault();

        if (highlights.length <= 0) {
            enqueueSnackbar('Add at least one Highlight', { variant: 'warning' });
            return;
        }
        if (specs.length <= 1) {
            enqueueSnackbar('Add Minimum 2 Specifications', { variant: 'warning' });
            return;
        }
        if (images.length <= 0) {
            enqueueSnackbar('Add at least one Product Image', { variant: 'warning' });
            return;
        }
        if (!brand) {
            enqueueSnackbar('Select a Brand', { variant: 'warning' });
            return;
        }
        // FE-017 FIX: cuttedPrice should be >= price (it represents the original/MRP price)
        if (Number(cuttedPrice) < Number(price)) {
            enqueueSnackbar('Cutted Price (MRP) must be greater than or equal to the selling Price', { variant: 'warning' });
            return;
        }

        const formData = new FormData();
        formData.set('name', name);
        formData.set('description', description);
        formData.set('price', price);
        formData.set('cuttedPrice', cuttedPrice);
        formData.set('category', category);
        formData.set('stock', stock);
        formData.set('brand', brand);

        images.forEach((image) => formData.append('images', image));
        highlights.forEach((h) => formData.append('highlights', h));
        specs.forEach((s) => formData.append('specifications', JSON.stringify(s)));

        dispatch(createProduct(formData));
    };

    // FE-002 FIX: split into two effects — one for mount-only data fetch, one for error/success handling
    useEffect(() => {
        dispatch(getMainCategories());
        dispatch(getAllBrands());
    }, [dispatch]); // runs once on mount only

    useEffect(() => {
        if (mainCategory) {
            dispatch(getSubCategories(mainCategory));
        }
    }, [dispatch, mainCategory]);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: 'error' });
            dispatch(clearErrors());
        }
        if (success) {
            enqueueSnackbar('Product Created Successfully', { variant: 'success' });
            dispatch({ type: NEW_PRODUCT_RESET });
            navigate('/admin/products');
        }
    }, [dispatch, error, success, navigate, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Admin: New Product | GlossyVibes" />

            {loading && <BackdropLoader />}
            <form onSubmit={newProductSubmitHandler} encType="multipart/form-data" className="flex flex-col sm:flex-row bg-white rounded-lg shadow p-4" id="mainform">

                <div className="flex flex-col gap-3 m-2 sm:w-1/2">
                    <TextField label="Name" variant="outlined" size="small" required value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField label="Description" multiline rows={3} required variant="outlined" size="small" value={description} onChange={(e) => setDescription(e.target.value)} />

                    <div className="flex justify-between">
                        <TextField
                            label="Price (Selling)"
                            type="number"
                            variant="outlined"
                            size="small"
                            InputProps={{ inputProps: { min: 0 } }}
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                        <TextField
                            label="Cutted Price (MRP)"
                            type="number"
                            variant="outlined"
                            size="small"
                            InputProps={{ inputProps: { min: 0 } }}
                            required
                            value={cuttedPrice}
                            onChange={(e) => setCuttedPrice(e.target.value)}
                            helperText="MRP must be ≥ selling price"
                        />
                    </div>

                    {/* Category selects */}
                    <div className="flex justify-between gap-4">
                        <FormControl fullWidth>
                            <InputLabel id="main-category-select-label">Main Category</InputLabel>
                            <Select labelId="main-category-select-label" value={mainCategory} label="Main Category" onChange={(e) => setMainCategory(e.target.value)} required>
                                <MenuItem value=""><em>Select Main Category</em></MenuItem>
                                {mainCategories?.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="sub-category-select-label">Sub Category</InputLabel>
                            <Select labelId="sub-category-select-label" value={category} label="Sub Category" onChange={(e) => setCategory(e.target.value)} required disabled={!mainCategory}>
                                <MenuItem value=""><em>Select Sub Category</em></MenuItem>
                                {subCategories?.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    {/* Brand */}
                    <FormControl fullWidth>
                        <InputLabel id="brand-select-label">Brand</InputLabel>
                        <Select labelId="brand-select-label" value={brand} label="Brand" onChange={(e) => setBrand(e.target.value)} required>
                            <MenuItem value=""><em>Select Brand</em></MenuItem>
                            {brands?.map((b) => (
                                <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField label="Stock" type="number" variant="outlined" size="small" InputProps={{ inputProps: { min: 0, max: 9999 } }} required value={stock} onChange={(e) => setStock(e.target.value)} />

                    {/* Highlights */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center border rounded">
                            <input value={highlightInput} onChange={(e) => setHighlightInput(e.target.value)} type="text" placeholder="Highlight" className="px-2 flex-1 outline-none border-none" />
                            <span onClick={addHighlight} className="py-2 px-6 bg-primary-blue text-white rounded-r hover:shadow-lg cursor-pointer">Add</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {highlights.map((h, i) => (
                                <div key={i} className="flex justify-between rounded items-center py-1 px-2 bg-green-50">
                                    <p className="text-green-800 text-sm font-medium">{h}</p>
                                    <span onClick={() => deleteHighlight(i)} className="text-red-600 hover:bg-red-100 p-1 rounded-full cursor-pointer"><DeleteIcon /></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Specifications + Images */}
                <div className="flex flex-col gap-2 m-2 sm:w-1/2">
                    <h2 className="font-medium">Specifications</h2>
                    <div className="flex justify-evenly gap-2 items-center">
                        <TextField value={specsInput.title} onChange={handleSpecsChange} name="title" label="Name" placeholder="Model No" variant="outlined" size="small" />
                        <TextField value={specsInput.description} onChange={handleSpecsChange} name="description" label="Description" placeholder="WJDK42DF5" variant="outlined" size="small" />
                        <span onClick={addSpecs} className="py-2 px-6 bg-primary-blue text-white rounded hover:shadow-lg cursor-pointer">Add</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {specs.map((spec, i) => (
                            <div key={i} className="flex justify-between items-center text-sm rounded bg-blue-50 py-1 px-2">
                                <p className="text-gray-500 font-medium">{spec.title}</p>
                                <p>{spec.description}</p>
                                <span onClick={() => deleteSpec(i)} className="text-red-600 hover:bg-red-200 bg-red-100 p-1 rounded-full cursor-pointer"><DeleteIcon /></span>
                            </div>
                        ))}
                    </div>

                    <h2 className="font-medium">Product Images</h2>
                    <div className="flex gap-2 overflow-x-auto h-32 border rounded">
                        {imagesPreview.map((image, i) => (
                            <img draggable="false" src={image} alt="Product" key={i} className="w-full h-full object-contain" />
                        ))}
                    </div>
                    <label className="rounded font-medium bg-gray-400 text-center cursor-pointer text-white p-2 shadow hover:shadow-lg my-2">
                        <input type="file" name="images" accept="image/*" multiple onChange={handleProductImageChange} className="hidden" />
                        Choose Files
                    </label>

                    <div className="flex justify-end">
                        <input form="mainform" type="submit" className="bg-primary-orange uppercase w-1/3 p-3 text-white font-medium rounded shadow hover:shadow-lg cursor-pointer" value="Submit" />
                    </div>
                </div>
            </form>
        </>
    );
};

export default NewProduct;
