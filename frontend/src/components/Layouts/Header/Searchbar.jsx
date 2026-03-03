import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Searchbar = () => {

    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/products/${keyword}`)
        } else {
            navigate('/products');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full px-4 py-2 flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] bg-white rounded-xl overflow-hidden border border-transparent focus-within:border-primary-pink transition-all duration-300">
            <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="text-xs sm:text-sm md:text-base flex-1 outline-none border-none placeholder-gray-400 px-2 sm:px-4 w-full bg-transparent"
                type="text"
                placeholder="Search for products, brands..."
            />
            <button type="submit" className="text-primary-pink hover:text-primary-violet px-2 sm:px-4 transition-colors h-full flex items-center justify-center min-h-[32px] sm:min-h-[40px]">
                <SearchIcon sx={{ fontSize: { xs: '20px', sm: '24px' } }} />
            </button>
        </form>
    );
};

export default Searchbar;
