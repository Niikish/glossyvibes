import { useEffect, Suspense } from 'react';
import Categories from '../Layouts/Categories';
import TopBrands from '../Layouts/TopBrands';
import Banner from './Banner/Banner';
import DealSlider from './DealSlider/DealSlider';
import ProductSlider from './ProductSlider/ProductSlider';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, getSliderProducts } from '../../actions/productAction';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import Loader from '../Layouts/Loader';
import ErrorBoundary from '../Layouts/ErrorBoundary';

const Home = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { error, loading } = useSelector((state) => state.products);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: "error" });
      dispatch(clearErrors());
    }
  }, [dispatch, error, enqueueSnackbar]);

  useEffect(() => {
    dispatch(getSliderProducts());
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Something went wrong! Please try again later.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MetaData title="Online Shopping Site for Mobiles, Electronics, Furniture, Grocery, Lifestyle, Books & More. Best Offers!" />
      <Categories />
      <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-3 mt-2 sm:mt-4">
        <Suspense fallback={<Loader />}>
          <Banner />
          <TopBrands />
          <DealSlider title={"Discounts for You"} />
          <ProductSlider title={"Suggested for You"} tagline={"Based on Your Activity"} />
          <DealSlider title={"Top Brands, Best Price"} />
          <ProductSlider title={"You May Also Like..."} tagline={"Based on Your Interest"} />
          <DealSlider title={"Top Offers On"} />
          <ProductSlider title={"Don't Miss These!"} tagline={"Inspired by your order"} />
        </Suspense>
      </main>
    </ErrorBoundary>
  );
};

export default Home;
