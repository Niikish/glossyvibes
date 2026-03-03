import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { getRandomProducts } from '../../../utils/functions';
import { settings } from '../DealSlider/DealSlider';
import Product from './Product';
import Loader from '../../Layouts/Loader';

const ProductSlider = ({ title, tagline }) => {
    const { loading, products, error } = useSelector((state) => state.products);

    if (loading) {
        return (
            <div className="bg-white w-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden rounded-2xl">
                <div className="flex px-4 sm:px-6 py-4 justify-between items-center">
                    <div className="title flex flex-col gap-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
                        <p className="text-sm text-gray-500">{tagline}</p>
                    </div>
                </div>
                <hr className="border-gray-100" />
                <div className="flex items-center justify-center p-8">
                    <Loader />
                </div>
            </div>
        );
    }

    if (error) {
        return null;
    }

    if (!Array.isArray(products) || products.length === 0) {
        return null;
    }

    const validProducts = products.filter(product =>
        product &&
        product._id &&
        Array.isArray(product.images) &&
        product.images.length > 0 &&
        product.images[0].url
    );

    if (validProducts.length === 0) {
        return null;
    }

    return (
        <section className="bg-white w-full shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden rounded-2xl my-4 sm:my-6">
            {/* <!-- header --> */}
            <div className="flex px-4 sm:px-6 py-4 justify-between items-center">
                <div className="title flex flex-col gap-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500">{tagline}</p>
                </div>
                <Link to="/products" className="bg-primary-blue hover:bg-blue-600 text-xs font-medium text-white px-6 py-2.5 sm:py-3 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 uppercase">view all</Link>
            </div>
            <hr className="border-gray-100" />
            <div className="p-2 sm:p-4 bg-white">
                <Slider {...settings} className="product-slider">
                    {getRandomProducts(validProducts, 12).map((product) => (
                        <Product {...product} key={product._id} />
                    ))}
                </Slider>
            </div>
        </section>
    );
};

export default ProductSlider;
