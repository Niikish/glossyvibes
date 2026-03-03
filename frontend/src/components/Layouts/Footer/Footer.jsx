import { useEffect, useState } from 'react';
import StoreIcon from '@mui/icons-material/Store';
import StarsIcon from '@mui/icons-material/Stars';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HelpIcon from '@mui/icons-material/Help';
import paymentMethods from '../../../assets/images/payment-methods.svg';
import { Link, useLocation } from 'react-router-dom';

const footerLinks = [
  {
    title: "about",
    links: [
      { name: "Contact Us", redirect: "#" },
      { name: "About Us", redirect: "#" },
      { name: "Careers", redirect: "#" },
      { name: "Our Story", redirect: "#" },
      { name: "Press", redirect: "#" },
      { name: "Partnerships", redirect: "#" },
    ]
  },
  {
    title: "help",
    links: [
      { name: "Payments", redirect: "#" },
      { name: "Shipping", redirect: "#" },
      { name: "Cancellation & Returns", redirect: "#" },
      { name: "FAQ", redirect: "#" },
    ]
  },
  {
    title: "policy",
    links: [
      { name: "Return Policy", redirect: "#" },
      { name: "Terms Of Use", redirect: "#" },
      { name: "Security", redirect: "#" },
      { name: "Privacy Policy", redirect: "#" },
      { name: "Sitemap", redirect: "#" },
    ]
  },
  {
    title: "social",
    links: [
      { name: "Instagram", redirect: "#" },
      { name: "Facebook", redirect: "#" },
      { name: "YouTube", redirect: "#" },
    ]
  }
];

const Footer = () => {

  const location = useLocation();
  const [adminRoute, setAdminRoute] = useState(false);

  useEffect(() => {
    setAdminRoute(location.pathname.split("/", 2).includes("admin"))
  }, [location]);

  return (
    <>
      {!adminRoute && (
        <>
          <footer className="mt-20 w-full py-4 px-4 bg-primary-darkBlue text-white text-xs border-b border-gray-600">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-7/12 grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {footerLinks.map((el, i) => (
                    <div className="flex flex-col gap-3" key={i}>
                      <h2 className="text-primary-grey uppercase font-medium tracking-wider mb-1">{el.title}</h2>
                      {el.links.map((item, j) => (
                        <a href={item.redirect} className="hover:underline opacity-80 hover:opacity-100 transition-opacity" key={j}>{item.name}</a>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block border-gray-600 h-48 border-l mx-4"></div>

                <div className="w-full lg:w-5/12 flex flex-col sm:flex-row gap-8 lg:gap-4 justify-between">
                  <div className="w-full sm:w-1/2">
                    <h2 className="text-primary-grey uppercase font-medium tracking-wider mb-2">Contact Us:</h2>
                    <p className="leading-5 opacity-80">
                      GlossyVibes Beauty Pvt. Ltd.,<br />
                      Tower B, Galaxy Business Park,<br />
                      Andheri East,<br />
                      Mumbai, 400069,<br />
                      Maharashtra, India
                    </p>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <h2 className="text-primary-grey uppercase font-medium tracking-wider mb-2">Registered Office:</h2>
                    <p className="leading-5 opacity-80">
                      GlossyVibes Beauty Pvt. Ltd.,<br />
                      Tower B, Galaxy Business Park,<br />
                      Andheri East,<br />
                      Mumbai, 400069,<br />
                      Maharashtra, India<br />
                      CIN: U74999MH2024PTC000001<br />
                      Email: <a className="text-primary-blue hover:underline" href="mailto:hello@glossyvibes.com">hello@glossyvibes.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </footer>


          <div className="bg-primary-darkBlue py-8">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-sm text-white">
              <div className="grid grid-cols-2 md:flex md:items-center gap-4 lg:gap-10">
                <Link to="/products" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                  <span className="text-yellow-400"><StoreIcon sx={{ fontSize: "18px" }} /></span>
                  <span className="text-xs sm:text-sm">Shop Now</span>
                </Link>
                <Link to="/wishlist" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                  <span className="text-yellow-400"><FavoriteIcon sx={{ fontSize: "18px" }} /></span>
                  <span className="text-xs sm:text-sm">Wishlist</span>
                </Link>
                <Link to="/orders" className="flex items-center gap-2 hover:text-yellow-400 transition-colors">
                  <span className="text-yellow-400"><StarsIcon sx={{ fontSize: "18px" }} /></span>
                  <span className="text-xs sm:text-sm">My Orders</span>
                </Link>
                <button onClick={() => { }} className="flex items-center gap-2 hover:text-yellow-400 transition-colors bg-transparent border-0 cursor-pointer">
                  <span className="text-yellow-400"><HelpIcon sx={{ fontSize: "18px" }} /></span>
                  <span className="text-xs sm:text-sm">Help Center</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-xs opacity-80">
                <span>&copy; 2024-{new Date().getFullYear()} GlossyVibes.com</span>
                <img draggable="false" className="h-4 sm:h-5 object-contain" src={paymentMethods} alt="Card Payment" />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
};

export default Footer;

