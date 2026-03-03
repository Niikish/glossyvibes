import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories } from '../../actions/categoryAction';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import FaceIcon from '@mui/icons-material/Face';
import SpaIcon from '@mui/icons-material/Spa';
import SanitizerIcon from '@mui/icons-material/Sanitizer';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import CategoryIcon from '@mui/icons-material/Category';

const iconMap = {
    'makeup': <FaceRetouchingNaturalIcon sx={{ fontSize: "32px" }} />,
    'skincare': <FaceIcon sx={{ fontSize: "32px" }} />,
    'personal-care': <SpaIcon sx={{ fontSize: "32px" }} />,
    'feminine-hygiene': <SanitizerIcon sx={{ fontSize: "32px" }} />,
    'hair-care': <ContentCutIcon sx={{ fontSize: "32px" }} />,
    'fragrances': <LocalFloristIcon sx={{ fontSize: "32px" }} />,
};

const Categories = () => {
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.categories);

    useEffect(() => {
        dispatch(getCategories());
    }, [dispatch]);

    // Build category tree: Main categories with their subcategories
    const mainCategories = categories?.filter(cat => !cat.parent) || [];
    const getSubCats = (parentId) => categories?.filter(cat => cat.parent === parentId) || [];

    const catItems = mainCategories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        icon: iconMap[cat.slug] || <CategoryIcon sx={{ fontSize: "32px" }} />,
        subCategories: getSubCats(cat._id)
    }));

    if (loading) return null; // Or a subtle loader if preferred

    return (
        <section className="bg-white mt-16 sm:mt-24 mb-2 sm:mb-4 min-w-full shadow-md sm:rounded-lg overflow-hidden">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 sm:pb-4 flex items-center justify-between overflow-x-auto no-scrollbar gap-4 sm:gap-0">
                {catItems.map((item, i) => (
                    <div key={i} className="group relative">
                        <Link
                            to={`/products?category=${item.slug}`}
                            className="flex flex-col gap-1 items-center p-2 group transition-transform hover:scale-105"
                        >
                            <div className="h-16 w-16 p-2 bg-primary-lavender bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-primary-pink group-hover:bg-opacity-20 transition-colors">
                                <span className="text-primary-pink group-hover:text-primary-violet transition-colors">
                                    {item.icon}
                                </span>
                            </div>
                            <span className="text-sm text-gray-800 font-medium group-hover:text-primary-pink">
                                {item.name}
                            </span>
                        </Link>

                        {item.subCategories.length > 0 && (
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <div className="py-2">
                                    {item.subCategories.map((subCat, j) => (
                                        <Link
                                            key={j}
                                            to={`/products?category=${subCat.slug}`}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-pink hover:bg-opacity-10 hover:text-primary-pink"
                                        >
                                            {subCat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Categories;
