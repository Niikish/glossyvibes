import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import { clearErrors, getProductDetails, getSimilarProducts, newReview } from '../../actions/productAction';
import { NextBtn, PreviousBtn } from '../Home/Banner/Banner';
import ProductSlider from '../Home/ProductSlider/ProductSlider';
import Loader from '../Layouts/Loader';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CachedIcon from '@mui/icons-material/Cached';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import { NEW_REVIEW_RESET } from '../../constants/productConstants';
import { addItemsToCart } from '../../actions/cartAction';
import { getDeliveryDate, getDiscount } from '../../utils/functions';
import { addToWishlist, removeFromWishlist } from '../../actions/wishlistAction';
import MinCategory from '../Layouts/MinCategory';
import MetaData from '../Layouts/MetaData';

const ProductDetails = () => {

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const params = useParams();
    const navigate = useNavigate();

    // reviews toggle
    const [open, setOpen] = useState(false);
    const [viewAll, setViewAll] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const { product, loading, error } = useSelector((state) => state.productDetails);
    const { success, error: reviewError } = useSelector((state) => state.newReview);
    const { cartItems } = useSelector((state) => state.cart);
    const { wishlistItems } = useSelector((state) => state.wishlist);

    const settings = {
        autoplay: true,
        autoplaySpeed: 2000,
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: <PreviousBtn />,
        nextArrow: <NextBtn />,
    };

    const productId = params.id;
    const itemInWishlist = wishlistItems.some((i) => i.product === productId);

    const addToWishlistHandler = () => {
        if (itemInWishlist) {
            dispatch(removeFromWishlist(productId));
            enqueueSnackbar("Remove From Wishlist", { variant: "success" });
        } else {
            dispatch(addToWishlist(productId));
            enqueueSnackbar("Added To Wishlist", { variant: "success" });
        }
    }

    const reviewSubmitHandler = () => {
        if (rating === 0 || !comment.trim()) {
            enqueueSnackbar("Empty Review", { variant: "error" });
            return;
        }
        const formData = new FormData();
        formData.set("rating", rating);
        formData.set("comment", comment);
        formData.set("productId", productId);
        dispatch(newReview(formData));
        setOpen(false);
    }

    const addToCartHandler = () => {
        dispatch(addItemsToCart(productId));
        enqueueSnackbar("Product Added To Cart", { variant: "success" });
    }

    const handleDialogClose = () => {
        setOpen(!open);
    }

    const itemInCart = cartItems.some((i) => i.product === productId);

    const goToCart = () => {
        navigate('/cart');
    }

    const buyNow = () => {
        addToCartHandler();
        navigate('/shipping');
    }

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (reviewError) {
            enqueueSnackbar(reviewError, { variant: "error" });
            dispatch(clearErrors());
        }
        if (success) {
            enqueueSnackbar("Review Submitted Successfully", { variant: "success" });
            dispatch({ type: NEW_REVIEW_RESET });
        }
    }, [dispatch, error, reviewError, success, enqueueSnackbar]);

    useEffect(() => {
        dispatch(getProductDetails(productId));
    }, [dispatch, productId]);

    useEffect(() => {
        dispatch(getSimilarProducts(product?.category));
    }, [dispatch, product, product.category]);

    return (
        <>
            {loading ? <Loader /> : (
                <>
                    <MetaData title={product.name} />
                    <MinCategory />
                    <main className="mt-12 sm:mt-0">
                        {/* product image & description container */}
                        <div className="w-full flex flex-col sm:flex-row bg-white sm:p-4 relative">
                            {/* image wrapper */}
                            <div className="w-full sm:w-2/5 sm:sticky top-16 sm:h-screen">
                                {/* imgbox */}
                                <div className="flex flex-col gap-4 m-3">
                                    <div className="w-full h-full pb-6 border rounded-lg shadow-sm relative overflow-hidden bg-primary-lavender bg-opacity-5">
                                        <Slider {...settings}>
                                            {product.images && product.images.map((item, i) => (
                                                <img draggable="false" className="w-full h-96 object-contain p-4 hover:scale-105 transition-transform duration-300" src={item.url} alt={product.name} key={i} />
                                            ))}
                                        </Slider>
                                        <div className="absolute top-4 right-4 shadow-lg bg-white w-10 h-10 border flex items-center justify-center rounded-full hover:bg-primary-pink hover:border-primary-pink transition-colors">
                                            <span onClick={addToWishlistHandler} className={`${itemInWishlist ? "text-red-500" : "text-gray-300 hover:text-white"} cursor-pointer`}>
                                                <FavoriteIcon sx={{ fontSize: "20px" }} />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full flex gap-4">
                                        {/* add to cart btn */}
                                        {product.stock > 0 && (
                                            <button onClick={itemInCart ? goToCart : addToCartHandler} className="p-4 w-1/2 flex items-center justify-center gap-2 text-white bg-primary-pink rounded-full shadow-md hover:shadow-lg hover:bg-primary-violet transition-colors">
                                                <ShoppingCartIcon />
                                                {itemInCart ? "GO TO CART" : "ADD TO CART"}
                                            </button>
                                        )}
                                        <button onClick={buyNow} disabled={product.stock < 1 ? true : false}
                                            className={product.stock < 1
                                                ? "p-4 w-full flex items-center justify-center gap-2 text-white bg-red-400 cursor-not-allowed rounded-full shadow-md"
                                                : "p-4 w-1/2 flex items-center justify-center gap-2 text-white bg-primary-coral rounded-full shadow-md hover:shadow-lg hover:bg-primary-orange transition-colors"}>
                                            <FlashOnIcon />
                                            {product.stock < 1 ? "OUT OF STOCK" : "BUY NOW"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* product desc wrapper */}
                            <div className="flex-1 py-2 px-6">
                                {/* product description */}
                                <div className="flex flex-col gap-4 mb-6">
                                    <h2 className="text-2xl font-medium text-primary-darkBlue hover:text-primary-pink transition-colors duration-300">{product.name}</h2>

                                    {/* rating badge */}
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm px-4 py-1.5 bg-gradient-to-r from-primary-pink to-primary-violet rounded-full text-white flex items-center gap-1 shadow-sm hover:shadow-md transition-shadow duration-300">
                                            {product.ratings && product.ratings.toFixed(1)} <StarIcon sx={{ fontSize: "14px" }} />
                                        </span>
                                        <span className="text-sm text-primary-grey hover:text-primary-pink transition-colors duration-300">{product.numOfReviews} Reviews</span>
                                    </div>

                                    {/* price desc */}
                                    <div className="bg-gradient-to-br from-primary-lavender/10 to-primary-pink/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                                        <span className="text-primary-pink text-sm font-medium">Special Price</span>
                                        <div className="flex items-baseline gap-2 text-3xl font-medium mt-2">
                                            <span className="text-primary-darkBlue">₹{product.price?.toLocaleString()}</span>
                                            <span className="text-base text-gray-500 line-through">₹{product.cuttedPrice?.toLocaleString()}</span>
                                            <span className="text-base text-primary-green bg-primary-green/10 px-2 py-0.5 rounded-full">{getDiscount(product.price, product.cuttedPrice)}%&nbsp;off</span>
                                        </div>
                                        {product.stock <= 10 && product.stock > 0 && (
                                            <span className="text-primary-coral text-sm font-medium mt-2 block bg-primary-coral/10 px-3 py-1 rounded-full inline-block">Hurry, Only {product.stock} left!</span>
                                        )}
                                    </div>

                                    {/* bank offers */}
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-primary-lavender/20 hover:border-primary-pink/20 transition-colors duration-300">
                                        <p className="text-lg font-medium text-primary-darkBlue mb-4 flex items-center gap-2">
                                            <LocalOfferIcon className="text-primary-pink" />
                                            Available offers
                                        </p>
                                        {Array(3).fill("").map((el, i) => (
                                            <p className="text-sm flex items-center gap-2 mb-3 group" key={i}>
                                                <span className="text-primary-pink group-hover:text-primary-violet transition-colors duration-300">
                                                    <LocalOfferIcon sx={{ fontSize: "20px" }} />
                                                </span>
                                                <span className="font-medium">Bank Offer</span> 15% Instant discount on first Pay Later order of 500 and above
                                                <Link className="text-primary-pink font-medium hover:text-primary-violet transition-colors duration-300 ml-1" to="/">T&C</Link>
                                            </p>
                                        ))}
                                    </div>

                                    {/* brand */}
                                    <div className="flex gap-8 items-center text-sm bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-primary-lavender/20">
                                        <img draggable="false" className="w-20 h-8 p-1 border rounded-lg object-contain hover:border-primary-pink transition-colors duration-300" src={product.brand?.logo?.url} alt={product.brand?.name} />
                                    </div>

                                    {/* delivery details */}
                                    <div className="flex gap-16 items-center text-sm font-medium bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-primary-lavender/20">
                                        <p className="text-primary-grey">Delivery</p>
                                        <span className="text-primary-darkBlue bg-primary-lavender/10 px-4 py-2 rounded-full">{getDeliveryDate()}</span>
                                    </div>

                                    {/* highlights & services */}
                                    <div className="flex flex-col sm:flex-row justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-primary-lavender/20">
                                        {/* highlights */}
                                        <div className="flex gap-16 items-stretch text-sm flex-1">
                                            <p className="text-primary-grey font-medium">Highlights</p>
                                            <ul className="list-none flex flex-col gap-3 text-primary-darkBlue">
                                                {product.highlights?.map((highlight, i) => (
                                                    <li key={i} className="flex items-center gap-2 group">
                                                        <span className="w-2 h-2 rounded-full bg-primary-pink group-hover:bg-primary-violet transition-colors duration-300"></span>
                                                        <span className="group-hover:text-primary-pink transition-colors duration-300">{highlight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* services */}
                                        <div className="flex gap-16 items-stretch text-sm flex-1">
                                            <p className="text-primary-grey font-medium">Services</p>
                                            <ul className="flex flex-col gap-4">
                                                <li>
                                                    <p className="flex items-center gap-3 group">
                                                        <span className="text-primary-pink group-hover:text-primary-violet transition-colors duration-300">
                                                            <CachedIcon sx={{ fontSize: "18px" }} />
                                                        </span>
                                                        <span className="group-hover:text-primary-pink transition-colors duration-300">
                                                            7 Days Replacement
                                                        </span>
                                                    </p>
                                                </li>
                                                <li>
                                                    <p className="flex items-center gap-3 group">
                                                        <span className="text-primary-pink group-hover:text-primary-violet transition-colors duration-300">
                                                            <CurrencyRupeeIcon sx={{ fontSize: "18px" }} />
                                                        </span>
                                                        <span className="group-hover:text-primary-pink transition-colors duration-300">
                                                            Cash on Delivery
                                                        </span>
                                                    </p>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* description */}
                                    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-primary-lavender/20">
                                        <h1 className="text-xl font-medium text-primary-darkBlue mb-4 flex items-center gap-2">
                                            <span className="w-1 h-6 bg-gradient-to-b from-primary-pink to-primary-violet rounded-full"></span>
                                            Product Description
                                        </h1>
                                        <p className="text-sm text-gray-600 leading-relaxed hover:text-primary-darkBlue transition-colors duration-300">{product.description}</p>
                                    </div>

                                    {/* specifications */}
                                    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-primary-lavender/20">
                                        <h1 className="text-xl font-medium text-primary-darkBlue mb-4 flex items-center gap-2">
                                            <span className="w-1 h-6 bg-gradient-to-b from-primary-pink to-primary-violet rounded-full"></span>
                                            Specifications
                                        </h1>
                                        {product.specifications?.map((spec, i) => (
                                            <div className="py-3 flex items-center text-sm group hover:bg-primary-lavender/5 rounded-lg transition-colors duration-300 px-3" key={i}>
                                                <p className="text-primary-grey w-3/12 group-hover:text-primary-pink transition-colors duration-300">{spec.title}</p>
                                                <p className="flex-1 text-gray-600 group-hover:text-primary-darkBlue transition-colors duration-300">{spec.description}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* reviews */}
                                    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-primary-lavender/20">
                                        <div className="flex justify-between items-center mb-6">
                                            <h1 className="text-xl font-medium text-primary-darkBlue flex items-center gap-2">
                                                <span className="w-1 h-6 bg-gradient-to-b from-primary-pink to-primary-violet rounded-full"></span>
                                                Ratings & Reviews
                                            </h1>
                                            <button onClick={handleDialogClose}
                                                className="px-6 py-2 bg-gradient-to-r from-primary-pink to-primary-violet text-white rounded-full shadow-sm hover:shadow-md transition-all duration-300">
                                                Write a Review
                                            </button>
                                        </div>

                                        <Dialog
                                            aria-labelledby='review-dialog'
                                            open={open}
                                            onClose={handleDialogClose}
                                            PaperProps={{
                                                style: {
                                                    borderRadius: '16px',
                                                    padding: '16px'
                                                }
                                            }}
                                        >
                                            <DialogTitle className="text-primary-darkBlue flex items-center gap-2">
                                                <span className="w-1 h-6 bg-gradient-to-b from-primary-pink to-primary-violet rounded-full"></span>
                                                Share Your Review
                                            </DialogTitle>
                                            <DialogContent className="flex flex-col gap-4 min-w-[400px]">
                                                <Rating
                                                    onChange={(e) => setRating(e.target.value)}
                                                    value={rating}
                                                    size='large'
                                                    precision={0.5}
                                                    sx={{
                                                        color: '#FF69B4',
                                                        '& .MuiRating-iconFilled': {
                                                            color: '#FF69B4',
                                                        },
                                                        '& .MuiRating-iconHover': {
                                                            color: '#FF1493',
                                                        },
                                                    }}
                                                />
                                                <TextField
                                                    label="Your Review"
                                                    multiline
                                                    rows={3}
                                                    variant="outlined"
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '12px',
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#FF69B4',
                                                                borderWidth: '2px',
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: '#FF69B4',
                                                            },
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: '#FF69B4',
                                                        },
                                                    }}
                                                />
                                            </DialogContent>
                                            <DialogActions className="p-4">
                                                <button onClick={handleDialogClose}
                                                    className="px-6 py-2 rounded-full border-2 border-primary-pink text-primary-pink hover:bg-primary-lavender/20 transition-all duration-300">
                                                    Cancel
                                                </button>
                                                <button onClick={reviewSubmitHandler}
                                                    className="px-6 py-2 rounded-full bg-gradient-to-r from-primary-pink to-primary-violet text-white shadow-sm hover:shadow-md transition-all duration-300">
                                                    Submit Review
                                                </button>
                                            </DialogActions>
                                        </Dialog>

                                        {/* review stats */}
                                        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary-lavender/20 to-primary-pink/5 rounded-2xl mb-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-semibold text-primary-darkBlue">
                                                    {product.ratings && product.ratings.toFixed(1)}
                                                </span>
                                                <StarIcon className="text-primary-pink" />
                                            </div>
                                            <p className="text-primary-grey">Based on {product.numOfReviews} Reviews</p>
                                        </div>

                                        {/* review list */}
                                        <div className="space-y-4">
                                            {(viewAll ? [...(product.reviews || [])] : [...(product.reviews || [])].slice(-3)).reverse().map((rev, i) => (
                                                <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-lavender/5 to-primary-pink/5 hover:from-primary-lavender/10 hover:to-primary-pink/10 transition-colors duration-300 group" key={i}>
                                                    <Rating
                                                        name="read-only"
                                                        value={rev.rating}
                                                        readOnly
                                                        size="small"
                                                        precision={0.5}
                                                        sx={{
                                                            color: '#FF69B4',
                                                            '& .MuiRating-iconFilled': {
                                                                color: '#FF69B4',
                                                            },
                                                        }}
                                                    />
                                                    <p className="mt-2 text-gray-600 group-hover:text-primary-darkBlue transition-colors duration-300">{rev.comment}</p>
                                                    <span className="text-sm text-primary-grey mt-2 block group-hover:text-primary-pink transition-colors duration-300">by {rev.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {product.reviews?.length > 3 && (
                                            <button onClick={() => setViewAll(!viewAll)}
                                                className="mt-6 px-6 py-2 rounded-full border-2 border-primary-pink text-primary-pink hover:bg-primary-lavender/20 transition-all duration-300">
                                                {viewAll ? "Show Less" : "View All Reviews"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Similar Products Slider */}
                        <div className="mt-12 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-primary-lavender/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-1 h-6 bg-gradient-to-b from-primary-pink to-primary-violet rounded-full"></span>
                                    <h2 className="text-2xl font-medium text-primary-darkBlue">You May Also Like</h2>
                                </div>
                                <p className="text-primary-grey ml-3">Based on your interest</p>
                                <div className="mt-8">
                                    <ProductSlider />
                                </div>
                            </div>
                        </div>
                    </main>
                </>
            )}
        </>
    );
};

export default ProductDetails;
