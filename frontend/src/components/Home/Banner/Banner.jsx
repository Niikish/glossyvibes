import { useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Banner.css';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import gadgetSale from '../../../assets/images/Banners/gadget-sale.jpg';
import kitchenSale from '../../../assets/images/Banners/kitchen-sale.jpg';
import poco from '../../../assets/images/Banners/poco-m4-pro.webp';
import realme from '../../../assets/images/Banners/realme-9-pro.webp';
import fashionSale from '../../../assets/images/Banners/fashionsale.jpg';
import oppo from '../../../assets/images/Banners/oppo-reno7.webp';

export const PreviousBtn = ({ className, onClick }) => {
  return (
    <div className={className} onClick={onClick} role="button" aria-label="Previous slide">
      <ArrowBackIosIcon />
    </div>
  )
}

export const NextBtn = ({ className, onClick }) => {
  return (
    <div className={className} onClick={onClick} role="button" aria-label="Next slide">
      <ArrowForwardIosIcon />
    </div>
  )
}

const Banner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const settings = {
    autoplay: true,
    autoplaySpeed: 2000,
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PreviousBtn />,
    nextArrow: <NextBtn />,
    responsive: [
      {
        breakpoint: 600,
        settings: {
          arrows: false,
          dots: true
        }
      }
    ]
  };

  const banners = [
    { img: gadgetSale, alt: "Amazing deals on gadgets and electronics" },
    { img: kitchenSale, alt: "Kitchen appliances on sale" },
    { img: poco, alt: "POCO M4 Pro smartphone" },
    { img: fashionSale, alt: "Fashion sale with great discounts" },
    { img: realme, alt: "Realme 9 Pro smartphone" },
    { img: oppo, alt: "OPPO Reno 7 smartphone" }
  ];

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setError(true);
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="h-44 sm:h-72 w-full rounded-sm shadow flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Failed to load banner images</p>
      </div>
    );
  }

  return (
    <section className="h-44 sm:h-56 md:h-72 w-full rounded-sm shadow relative overflow-hidden group" role="banner">

      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
      )}
      <Slider {...settings}>
        {banners.map((banner, i) => (
          <div key={i} className="outline-none">
            <img
              draggable="false"
              className="h-44 sm:h-56 md:h-72 w-full object-cover"

              src={banner.img}
              alt={banner.alt}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default Banner;
