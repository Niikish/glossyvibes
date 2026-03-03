/* This file is not being used. The active Sidebar component is in the ./Sidebar/Sidebar.jsx file.
 * 
 * import { useNavigate } from 'react-router-dom';
 * import DashboardIcon from '@mui/icons-material/Dashboard';
 * import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
 * import PersonIcon from '@mui/icons-material/Person';
 * import ListAltIcon from '@mui/icons-material/ListAlt';
 * import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
 * import CategoryIcon from '@mui/icons-material/Category';
 * import LocalOfferIcon from '@mui/icons-material/LocalOffer';
 * 
 * const Sidebar = ({ activeTab }) => {
 *     const navigate = useNavigate();
 * 
 *     const navMenu = [
 *         {
 *             icon: <DashboardIcon />,
 *             label: "Dashboard",
 *             ref: "/admin/dashboard",
 *             active: activeTab === 0
 *         },
 *         {
 *             icon: <CategoryIcon />,
 *             label: "Categories",
 *             ref: "/admin/categories",
 *             active: activeTab === 7
 *         },
 *         {
 *             icon: <ShoppingCartIcon />,
 *             label: "Products",
 *             ref: "/admin/products",
 *             active: activeTab === 2
 *         },
 *         {
 *             icon: <ListAltIcon />,
 *             label: "Orders",
 *             ref: "/admin/orders",
 *             active: activeTab === 1
 *         },
 *         {
 *             icon: <PersonIcon />,
 *             label: "Users",
 *             ref: "/admin/users",
 *             active: activeTab === 5
 *         },
 *         {
 *             icon: <ShoppingBagIcon />,
 *             label: "Brands",
 *             ref: "/admin/brands",
 *             active: activeTab === 6
 *         },
 *         {
 *             icon: <LocalOfferIcon />,
 *             label: "Coupons",
 *             ref: "/admin/coupons",
 *             active: activeTab === 8
 *         },
 *     ];
 * 
 *     return (
 *         <aside className="h-full shadow-sm shadow-gray-300 bg-white w-60 flex flex-col space-y-6 overflow-hidden">
 *             <div className="flex flex-col space-y-1">
 *                 {navMenu.map((item, index) => (
 *                     <div
 *                         key={index}
 *                         className={`flex items-center py-3 px-4 hover:bg-gray-50 cursor-pointer ${item.active ? 'bg-blue-50 text-primary-blue' : ''}`}
 *                         onClick={() => navigate(item.ref)}
 *                     >
 *                         <span className={`${item.active ? 'text-primary-blue' : ''}`}>{item.icon}</span>
 *                         <span className={`ml-4 font-medium ${item.active ? 'text-primary-blue' : ''}`}>{item.label}</span>
 *                     </div>
 *                 ))}
 *             </div>
 *         </aside>
 *     );
 * };
 * 
 * export default Sidebar;
 */ 