import { useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import Searchbar from './Searchbar';
import logo from '../../../assets/images/glossyvibes-logo.svg';
import PrimaryDropDownMenu from './PrimaryDropDownMenu';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Header = () => {

  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cartItems } = useSelector(state => state.cart);

  const [togglePrimaryDropDown, setTogglePrimaryDropDown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (togglePrimaryDropDown && !event.target.closest('.userDropDown') && !event.target.closest('.primaryDropDown')) {
        setTogglePrimaryDropDown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [togglePrimaryDropDown]);

  return (
    <header className="bg-primary-pink fixed top-0 w-full z-40 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      {/* Main navbar row */}
      <div className="h-16 sm:h-20 flex items-center">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-4 sm:gap-6 relative">

          {/* Logo & Desktop Search */}
          <div className="flex items-center flex-1 gap-2 sm:gap-6 h-full min-w-0">
            <Link className="h-10 sm:h-12 flex items-center shrink-0 min-h-[44px]" to="/">
              <img draggable="false" className="h-full w-auto object-contain max-h-[40px] sm:max-h-full" src={logo} alt="GlossyVibes" />
            </Link>

            {/* Desktop searchbar */}
            <div className="flex-1 max-w-2xl hidden sm:block">
              <Searchbar />
            </div>
          </div>

          {/* Right navs */}
          <div className="flex items-center justify-end shrink-0 gap-1 sm:gap-8 relative">

            {/* Mobile search toggle */}
            <button
              className="sm:hidden text-white p-2 h-11 w-11 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              onClick={() => setShowMobileSearch(prev => !prev)}
              aria-label="Toggle search"
            >
              <SearchIcon />
            </button>

            {isAuthenticated === false ?
              <Link to="/login" className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-primary-pink bg-white font-medium rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 z-10 min-h-[44px] flex items-center">Login</Link>
              :
              (
                <span className="userDropDown flex items-center text-white font-medium gap-1 cursor-pointer hover:text-primary-lavender min-h-[44px] px-1" onClick={() => setTogglePrimaryDropDown(!togglePrimaryDropDown)}>
                  <span className="max-w-[80px] sm:max-w-none truncate">{user.name && user.name.split(" ", 1)}</span>
                  <span>{togglePrimaryDropDown ? <ExpandLessIcon sx={{ fontSize: "20px" }} /> : <ExpandMoreIcon sx={{ fontSize: "20px" }} />}</span>
                </span>
              )
            }

            {togglePrimaryDropDown && <PrimaryDropDownMenu setTogglePrimaryDropDown={setTogglePrimaryDropDown} user={user} />}

            <Link to="/cart" className="flex items-center text-white font-medium gap-2 relative hover:text-primary-lavender transition-colors min-h-[44px] px-1">
              <span className="flex items-center h-11 w-11 justify-center"><ShoppingCartIcon /></span>
              {cartItems.length > 0 &&
                <div className="w-5 h-5 bg-primary-rose text-[10px] sm:text-xs text-white font-bold rounded-full absolute top-0 left-7 flex justify-center items-center border border-white">
                  {cartItems.length}
                </div>
              }
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile search bar — only shows when toggled */}
      {showMobileSearch && (
        <div className="sm:hidden w-full px-4 py-2 bg-primary-pink border-t border-white border-opacity-20 shadow-inner">
          <Searchbar onSearch={() => setShowMobileSearch(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;
