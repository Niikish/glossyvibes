import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link } from 'react-router-dom';
import { getDiscount } from '../../utils/functions';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../actions/wishlistAction';
import { useSnackbar } from 'notistack';

const Product = ({ _id, name, images, ratings, numOfReviews, price, cuttedPrice }) => {

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

    const defaultImage = "https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/placeholder-square_0ee3c0.svg";

    return (
        <div className="flex flex-col items-start gap-3 p-4 relative hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-2xl transition-all duration-300 hover:-translate-y-1 h-full bg-white group border border-gray-50">
            {/* <!-- image & product title --> */}
            <Link to={`/product/${_id}`} className="flex flex-col w-full h-full">
                <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-2">
                    <img
                        draggable="false"
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        src={images && images[0] ? images[0].url : defaultImage}
                        alt={name || "Product Image"}
                    />
                </div>
                <h2 className="text-sm mt-3 text-gray-800 font-medium group-hover:text-primary-pink line-clamp-2 min-h-[40px]">
                    {name || "Product Name"}
                </h2>
            </Link>
            {/* <!-- image & product title --> */}

            {/* <!-- product info --> */}
            <div className="flex flex-col gap-1.5 items-start w-full mt-1">
                {/* <!-- rating badge --> */}
                <span className="text-sm text-gray-500 font-medium flex gap-2 items-center">
                    <span className="text-xs px-2 py-1 bg-primary-green rounded-[4px] text-white flex items-center gap-0.5 shadow-sm">{(ratings || 0).toFixed(1)} <StarIcon sx={{ fontSize: "14px" }} /></span>
                    <span>({numOfReviews || 0})</span>
                </span>
                {/* <!-- rating badge --> */}

                {/* <!-- price container --> */}
                <div className="flex items-center gap-1.5 text-md font-medium">
                    <span>₹{(price || 0).toLocaleString()}</span>
                    <span className="text-gray-500 line-through text-xs">₹{(cuttedPrice || 0).toLocaleString()}</span>
                    <span className="text-xs text-primary-green">{getDiscount(price || 0, cuttedPrice || 0)}%&nbsp;off</span>
                </div>
                {/* <!-- price container --> */}
            </div>
            {/* <!-- product description --> */}

            {/* <!-- wishlist badge --> */}
            <span onClick={addToWishlistHandler} className={`${itemInWishlist ? "text-red-500" : "hover:text-red-500 text-gray-300"} absolute top-6 right-6 cursor-pointer`}><FavoriteIcon sx={{ fontSize: "18px" }} /></span>
            {/* <!-- wishlist badge --> */}

        </div>
    );
};

export default Product;
