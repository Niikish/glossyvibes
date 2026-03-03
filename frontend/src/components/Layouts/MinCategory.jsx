import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getMainCategories } from '../../actions/categoryAction';

const MinCategory = () => {
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.mainCategories);

    useEffect(() => {
        dispatch(getMainCategories());
    }, [dispatch]);

    if (loading) return null;

    return (
        <section className="bg-white w-full overflow-hidden border-b mt-16 sm:mt-20">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between p-0.5 overflow-x-auto no-scrollbar gap-4 sm:gap-0">
                {categories && categories.map((el, i) => (
                    <Link to={`/products?category=${el.slug}`} key={i} className="text-sm p-2 text-gray-800 font-medium hover:text-primary-pink flex items-center gap-0.5 group shrink-0">
                        {el.name}
                        <span className="text-gray-400 group-hover:text-primary-pink">
                            <ExpandMoreIcon sx={{ fontSize: "16px" }} />
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default MinCategory;
