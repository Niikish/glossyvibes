import { useState, memo } from 'react';
import { getDiscount } from '../../../utils/functions';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../../actions/wishlistAction';
import { useSnackbar } from 'notistack';

const Product = (props) => {
    const { _id, name = '', images = [], ratings = 0, numOfReviews = 0, price = 0, cuttedPrice = 0 } = props;

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { wishlistItems } = useSelector((state) => state.wishlist);
    const itemInWishlist = wishlistItems.some((i) => i.product === _id);

    const addToWishlistHandler = () => {
        if (itemInWishlist) {
            dispatch(removeFromWishlist(_id));
            enqueueSnackbar("Remove From Wishlist", { variant: "success" });
        } else {
            dispatch(addToWishlist(_id));
            enqueueSnackbar("Added To Wishlist", { variant: "success" });
        }
    }

    if (!_id || !images.length) {
        return null;
    }

    const imageUrl = images[0]?.url || '';
    if (!imageUrl) {
        return null;
    }

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="flex flex-col items-center gap-2 px-2 py-6 relative hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-white">
            {/* <!-- image & product title --> */}
            <Link to={`/product/${_id}`} className="flex flex-col items-center text-center group">
                <div className="w-36 h-36 relative">
                    {!imageLoaded && !imageError && (
                        <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg"></div>
                    )}
                    {imageError ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                            <span className="text-gray-400">Image not available</span>
                        </div>
                    ) : (
                        <img
                            draggable="false"
                            className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            src={imageUrl}
                            alt={name}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            loading="lazy"
                        />
                    )}
                </div>
                <h2 className="text-sm mt-4 group-hover:text-primary-blue text-ellipsis overflow-hidden" title={name}>
                    {name.length > 50 ? `${name.substring(0, 50)}...` : name}
                </h2>
            </Link>
            {/* <!-- image & product title --> */}

            {/* <!-- product description --> */}
            <div className="flex flex-col gap-2 items-center">
                {/* <!-- rating badge --> */}
                <span className="text-sm text-gray-500 font-medium flex gap-2 items-center">
                    <span className="text-xs px-2 py-1 bg-primary-green rounded-[4px] text-white flex items-center gap-0.5 shadow-sm">
                        {ratings.toFixed(1)} <StarIcon sx={{ fontSize: "14px" }} />
                    </span>
                    <span>({numOfReviews.toLocaleString()})</span>
                </span>
                {/* <!-- rating badge --> */}

                {/* <!-- price container --> */}
                <div className="flex items-center gap-1.5 text-md font-medium">
                    <span>₹{price.toLocaleString()}</span>
                    <span className="text-gray-500 line-through text-xs">₹{cuttedPrice.toLocaleString()}</span>
                    <span className="text-xs text-primary-green">{getDiscount(price, cuttedPrice)}%&nbsp;off</span>
                </div>
                {/* <!-- price container --> */}
            </div>
            {/* <!-- product description --> */}

            {/* <!-- wishlist badge --> */}
            <button
                onClick={addToWishlistHandler}
                className={`${itemInWishlist ? "text-red-500" : "hover:text-red-500 text-gray-300"} absolute top-5 right-2 cursor-pointer transition-colors`}
                aria-label={itemInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
                <FavoriteIcon sx={{ fontSize: "16px" }} />
            </button>
            {/* <!-- wishlist badge --> */}

        </div>
    );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(Product);
