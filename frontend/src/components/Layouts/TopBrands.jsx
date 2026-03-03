import { useEffect, useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFeaturedBrands, clearErrors } from '../../actions/brandAction';
import { useSnackbar } from 'notistack';

const TopBrands = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { brands, loading, error } = useSelector((state) => state.featuredBrands);
    const [loadedImages, setLoadedImages] = useState(new Set());

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        dispatch(getFeaturedBrands());
    }, [dispatch, error, enqueueSnackbar]);

    const handleImageLoad = (brandId) => {
        setLoadedImages(prev => new Set([...prev, brandId]));
    };

    if (error) {
        return (
            <section className="bg-white mt-16 sm:mt-24 mb-2 sm:mb-4 min-w-full shadow-md sm:rounded-lg overflow-hidden">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 sm:pb-4 flex items-center justify-between overflow-x-auto no-scrollbar gap-4 sm:gap-0">

                    <h1 className="text-xl font-medium">Top Brands</h1>
                </div>
                <div className="flex items-center justify-center h-32 text-gray-500">
                    Failed to load brands. Please try again later.
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white w-full shadow overflow-hidden p-4" aria-label="Top Brands Section">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-medium">Top Brands</h1>
                <Link
                    to="/brands"
                    className="text-primary-pink hover:underline focus:outline-none focus:ring-2 focus:ring-primary-pink focus:ring-offset-2 rounded-sm"
                    aria-label="View all brands"
                >
                    View All
                </Link>
            </div>
            <div className="flex items-center justify-center flex-wrap gap-6" role="list">
                {loading ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="animate-pulse" role="listitem">
                            <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded mt-2 mx-auto"></div>
                        </div>
                    ))
                ) : brands && brands.length > 0 ? (
                    brands.map((brand) => (
                        <Link
                            key={brand._id}
                            to={`/products?brand=${encodeURIComponent(brand.name)}`}
                            className="flex flex-col items-center gap-1 group transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-pink focus:ring-offset-2 rounded-full"
                            aria-label={`View ${brand.name} products`}
                            role="listitem"
                            data-testid={`brand-link-${brand.name}`}
                        >
                            <div className="relative h-24 w-24 p-2 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                {!loadedImages.has(brand._id) && (
                                    <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
                                )}
                                <img
                                    draggable="false"
                                    className={`h-full w-full object-contain rounded-full transition-opacity duration-300 ${loadedImages.has(brand._id) ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    src={brand.logo.url}
                                    alt={`${brand.name} logo`}
                                    onLoad={() => handleImageLoad(brand._id)}
                                    loading="lazy"
                                />
                            </div>
                            <span className="text-sm text-gray-800 font-medium group-hover:text-primary-pink transition-colors">
                                {brand.name}
                            </span>
                        </Link>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        No brands available
                    </div>
                )}
            </div>
        </section>
    );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(TopBrands); 