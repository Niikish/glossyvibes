import { useState, useEffect, memo } from 'react';
import Product from './Product';
import Slider from 'react-slick';
import { NextBtn, PreviousBtn } from '../Banner/Banner';
import { Link } from 'react-router-dom';
import { offerProducts } from '../../../utils/constants';
import { getRandomProducts } from '../../../utils/functions';
import Loader from '../../Layouts/Loader';

export const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 6,
    initialSlide: 1,
    swipe: false,
    prevArrow: <PreviousBtn />,
    nextArrow: <NextBtn />,
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
                swipe: true
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
                initialSlide: 2,
                swipe: true
            }
        },
        {
            breakpoint: 480,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                swipe: true
            }
        }
    ]
};

const DealSlider = ({ title }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const randomProducts = getRandomProducts(offerProducts, 12);
            if (randomProducts.length === 0) {
                throw new Error('No products available');
            }
            setProducts(randomProducts);
            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return (
            <section className="bg-white w-full shadow overflow-hidden">
                <div className="flex px-6 py-3 justify-between items-center">
                    <h1 className="text-xl font-medium">{title}</h1>
                </div>
                <hr />
                <div className="flex items-center justify-center p-8">
                    <Loader />
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-white w-full shadow overflow-hidden">
                <div className="flex px-6 py-3 justify-between items-center">
                    <h1 className="text-xl font-medium">{title}</h1>
                </div>
                <hr />
                <div className="flex items-center justify-center p-8 text-gray-500">
                    {error}
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white w-full shadow overflow-hidden">
            <div className="flex px-6 py-3 justify-between items-center">
                <h1 className="text-xl font-medium">{title}</h1>
                <Link to="/products" className="bg-primary-blue text-xs font-medium text-white px-5 py-2.5 rounded-sm shadow-lg hover:bg-blue-600 transition-colors">
                    VIEW ALL
                </Link>
            </div>
            <hr />
            <div className="relative">
                <Slider {...settings}>
                    {products.map((item, i) => (
                        <Product {...item} key={i} />
                    ))}
                </Slider>
            </div>
        </section>
    );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(DealSlider);
