import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Pagination from '@mui/material/Pagination';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Slider from '@mui/material/Slider';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { clearErrors, getProducts } from '../../actions/productAction';
import Loader from '../Layouts/Loader';
import Product from './Product';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StarIcon from '@mui/icons-material/Star';
import MetaData from '../Layouts/MetaData';
import { getAllBrands } from '../../actions/brandAction';
import { getMainCategories } from '../../actions/categoryAction';

const Products = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [price, setPrice] = useState([0, 200000]);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const [ratings, setRatings] = useState(0);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);

    // filter toggles
    const [categoryToggle, setCategoryToggle] = useState(true);
    const [brandToggle, setBrandToggle] = useState(true);
    const [ratingsToggle, setRatingsToggle] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);


    const { products, loading, error, resultPerPage, filteredProductsCount } = useSelector((state) => state.products);
    const { brands: allBrands } = useSelector((state) => state.brands);
    const { categories: mainCategories } = useSelector((state) => state.mainCategories);
    const keyword = params.keyword;

    const priceHandler = (e, newPrice) => {
        setPrice(newPrice);
    }

    const clearFilters = () => {
        setPrice([0, 200000]);
        setRatings(0);
        // Reset URL parameters
        setSearchParams({});
    }

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
    }, [dispatch, error, enqueueSnackbar]);

    useEffect(() => {
        // Load all brands and categories for the filter
        dispatch(getAllBrands());
        dispatch(getMainCategories());

        dispatch(getProducts(
            keyword,
            category || undefined,
            price,
            ratings,
            currentPage,
            brand || undefined
        ));
    }, [dispatch, keyword, category, price, ratings, currentPage, brand]);

    return (
        <>
            <MetaData title="All Products | GlossyVibes" />

            <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 sm:mt-24">

                {/* <!-- row --> */}
                <div className="flex flex-col md:flex-row gap-3 mt-2 sm:mt-2 mb-7">

                    {/* <!-- sidebar column  --> */}
                    <div className={`${showMobileFilters ? "fixed inset-0 z-50 flex" : "hidden md:flex"} flex flex-col w-full md:w-1/4 lg:w-1/5 shrink-0 transition-all duration-300`}>

                        {/* Mobile Overlay */}
                        {showMobileFilters && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 md:hidden" onClick={() => setShowMobileFilters(false)}></div>
                        )}

                        {/* <!-- nav tiles --> */}
                        <div className={`${showMobileFilters ? "relative w-3/4 max-w-xs h-full bg-white ml-auto flex flex-col shadow-2xl" : "flex flex-col bg-white rounded-sm shadow"}`}>

                            {/* <!-- filters header --> */}
                            <div className="flex items-center justify-between gap-5 px-4 py-4 border-b">
                                <p className="text-lg font-medium">Filters</p>
                                <div className="flex items-center gap-4">
                                    <span className="uppercase text-primary-blue text-xs cursor-pointer font-medium" onClick={() => clearFilters()}>clear all</span>
                                    {showMobileFilters && (
                                        <button className="md:hidden p-2 text-xl font-bold" onClick={() => setShowMobileFilters(false)}>✕</button>
                                    )}
                                </div>
                            </div>


                            <div className="flex-1 overflow-y-auto">
                                <div className="flex flex-col gap-2 py-3 text-sm overflow-hidden">


                                    {/* price slider filter */}
                                    <div className="flex flex-col gap-2 border-b px-4">
                                        <span className="font-medium text-xs">PRICE</span>

                                        <Slider
                                            value={price}
                                            onChange={priceHandler}
                                            valueLabelDisplay="auto"
                                            getAriaLabel={() => 'Price range slider'}
                                            min={0}
                                            max={200000}
                                        />

                                        <div className="flex gap-3 items-center justify-between mb-2 min-w-full">
                                            <span className="flex-1 border px-4 py-1 rounded-sm text-gray-800 bg-gray-50">₹{price[0].toLocaleString()}</span>
                                            <span className="font-medium text-gray-400">to</span>
                                            <span className="flex-1 border px-4 py-1 rounded-sm text-gray-800 bg-gray-50">₹{price[1].toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {/* price slider filter */}

                                    {/* category filter */}
                                    <div className="flex flex-col border-b px-4">

                                        <div className="flex justify-between cursor-pointer py-2 pb-4 items-center" onClick={() => setCategoryToggle(!categoryToggle)}>
                                            <p className="font-medium text-xs uppercase">Category</p>
                                            {categoryToggle ?
                                                <ExpandLessIcon sx={{ fontSize: "20px" }} /> :
                                                <ExpandMoreIcon sx={{ fontSize: "20px" }} />
                                            }
                                        </div>

                                        {categoryToggle && (
                                            <div className="flex flex-col pb-1">
                                                <FormControl>
                                                    <RadioGroup
                                                        aria-labelledby="category-radio-buttons-group"
                                                        onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), category: e.target.value })}
                                                        name="category-radio-buttons"
                                                        value={category || ""}
                                                    >
                                                        {mainCategories && mainCategories.map((el) => (
                                                            <FormControlLabel key={el._id} value={el.slug} control={<Radio size="small" />} label={<span className="text-sm">{el.name}</span>} />
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                            </div>
                                        )}

                                    </div>
                                    {/* category filter */}

                                    {/* brand filter */}
                                    <div className="flex flex-col border-b px-4">

                                        <div className="flex justify-between cursor-pointer py-2 pb-4 items-center" onClick={() => setBrandToggle(!brandToggle)}>
                                            <p className="font-medium text-xs uppercase">Brand</p>
                                            {brandToggle ?
                                                <ExpandLessIcon sx={{ fontSize: "20px" }} /> :
                                                <ExpandMoreIcon sx={{ fontSize: "20px" }} />
                                            }
                                        </div>

                                        {brandToggle && (
                                            <div className="flex flex-col pb-1">
                                                <FormControl>
                                                    <RadioGroup
                                                        aria-labelledby="brand-radio-buttons-group"
                                                        onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), brand: e.target.value })}
                                                        name="brand-radio-buttons"
                                                        value={brand || ""}
                                                    >
                                                        {allBrands && allBrands.map((el) => (
                                                            <FormControlLabel key={el._id} value={el.name} control={<Radio size="small" />} label={<span className="text-sm">{el.name}</span>} />
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                            </div>
                                        )}

                                    </div>
                                    {/* brand filter */}

                                    {/* ratings filter */}
                                    <div className="flex flex-col border-b px-4">

                                        <div className="flex justify-between cursor-pointer py-2 pb-4 items-center" onClick={() => setRatingsToggle(!ratingsToggle)}>
                                            <p className="font-medium text-xs uppercase">ratings</p>
                                            {ratingsToggle ?
                                                <ExpandLessIcon sx={{ fontSize: "20px" }} /> :
                                                <ExpandMoreIcon sx={{ fontSize: "20px" }} />
                                            }
                                        </div>

                                        {ratingsToggle && (
                                            <div className="flex flex-col pb-1">
                                                <FormControl>
                                                    <RadioGroup
                                                        aria-labelledby="ratings-radio-buttons-group"
                                                        onChange={(e) => setRatings(e.target.value)}
                                                        value={ratings}
                                                        name="ratings-radio-buttons"
                                                    >
                                                        {[4, 3, 2, 1].map((el, i) => (
                                                            <FormControlLabel key={i} value={el} control={<Radio size="small" />} label={<span className="flex items-center text-sm">{el}<StarIcon sx={{ fontSize: "12px", mr: 0.5 }} /> & above</span>} />
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                            </div>
                                        )}

                                    </div>
                                    {/* ratings filter */}

                                </div>

                                {showMobileFilters && (
                                    <div className="p-4 border-t sticky bottom-0 bg-white">
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="w-full py-3 bg-primary-pink text-white font-bold rounded shadow-lg uppercase tracking-wider active:scale-95 transition-transform"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* <!-- nav tiles --> */}

                        </div>
                    </div>
                    {/* <!-- sidebar column  --> */}

                    {/* <!-- search column --> */}
                    <div className="flex-1 w-full">
                        {/* Mobile Filter Toggle Bar */}
                        <div className="md:hidden flex items-center justify-between p-3 bg-white shadow-sm mb-2 rounded">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded border hover:bg-gray-100 transition-colors active:scale-95"
                            >
                                <span className="rotate-90"><ExpandMoreIcon /></span> Filters
                            </button>
                            <span className="text-xs text-gray-500 font-medium">
                                {filteredProductsCount} Products found
                            </span>
                        </div>


                        {!loading && products?.length === 0 && (
                            <div className="flex flex-col items-center justify-center gap-3 bg-white shadow-sm rounded-sm p-6 sm:p-16">
                                <img draggable="false" className="w-1/2 h-44 object-contain" src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/error-no-search-results_2353c5.png" alt="Search Not Found" />
                                <h1 className="text-2xl font-medium text-gray-900">Sorry, no results found!</h1>
                                <p className="text-xl text-center text-primary-grey">Please check the spelling or try searching for something else</p>
                            </div>
                        )}

                        {loading ? <Loader /> : (
                            <div className="flex flex-col gap-4 pb-4 justify-center items-center w-full overflow-hidden bg-white sm:rounded-sm shadow-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full place-content-start overflow-hidden pb-4 border-b">
                                    {products?.map((product) => (
                                        <Product {...product} key={product._id} />
                                    ))}
                                </div>
                                {filteredProductsCount > resultPerPage && (
                                    <Pagination
                                        count={Number(((filteredProductsCount + 6) / resultPerPage).toFixed())}
                                        page={currentPage}
                                        onChange={(e, val) => setCurrentPage(val)}
                                        color="primary"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    {/* <!-- search column --> */}
                </div>
                {/* <!-- row --> */}

            </main>
        </>
    );
};

export default Products;
