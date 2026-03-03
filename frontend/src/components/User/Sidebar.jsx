import { useDispatch, useSelector } from 'react-redux';
import FolderIcon from '@mui/icons-material/Folder';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { logoutUser } from '../../actions/userAction';

const Sidebar = ({ activeTab }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const { user } = useSelector(state => state.user);

    const handleLogout = () => {
        dispatch(logoutUser());
        enqueueSnackbar("Logout Successfully", { variant: "success" });
        navigate("/login");
    }

    const defaultAvatar = "https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/profile-pic-male_4811a1.svg";

    return (
        <>
            {/* ── Desktop sidebar (lg+): original vertical layout ── */}
            <div className="hidden lg:flex flex-col gap-4 w-full lg:w-1/4 px-1 sticky top-20 h-fit z-10">

                {/* profile card */}
                <div className="flex items-center gap-4 p-3 bg-white rounded-sm shadow">
                    <div className="w-12 h-12 rounded-full shrink-0">
                        <img
                            draggable="false"
                            className="h-full w-full object-cover rounded-full"
                            src={user?.avatar?.url || defaultAvatar}
                            alt="Avatar"
                        />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <p className="text-xs">Hello,</p>
                        <h2 className="font-medium truncate">{user?.name || "Guest"}</h2>
                    </div>
                </div>

                {/* nav tiles */}
                <div className="flex flex-col bg-white rounded-sm shadow">

                    <div className="flex items-center gap-5 px-4 py-4 border-b">
                        <span className="text-primary-blue"><FolderIcon /></span>
                        <Link className="flex w-full justify-between font-medium text-gray-500 hover:text-primary-blue" to="/orders">
                            MY ORDERS
                            <span><ChevronRightIcon /></span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-5 px-4 py-4">
                        <span className="text-primary-blue"><PersonIcon /></span>
                        <p className="flex w-full justify-between font-medium text-gray-500">ACCOUNT SETTINGS</p>
                    </div>
                    <div className="flex flex-col pb-3 border-b text-sm">
                        <Link to="/account" className={`${activeTab === "profile" ? "bg-blue-50 text-primary-blue font-medium" : "hover:bg-blue-50 hover:text-primary-blue"} p-3 pl-14`}>Profile Information</Link>
                        <Link className="p-3 pl-14 hover:bg-blue-50 hover:text-primary-blue" to="/">Manage Addresses</Link>
                    </div>

                    <div className="flex items-center gap-5 px-4 py-4">
                        <span className="text-primary-blue"><FolderSharedIcon /></span>
                        <p className="flex w-full justify-between font-medium text-gray-500">MY STUFF</p>
                    </div>
                    <div className="flex flex-col pb-3 border-b text-sm">
                        <Link to="/account/coupons" className={`${activeTab === "coupons" ? "bg-blue-50 text-primary-blue font-medium" : "hover:bg-blue-50 hover:text-primary-blue"} p-3 pl-14`}>My Coupons</Link>
                        <Link to="/wishlist" className={`${activeTab === "wishlist" ? "bg-blue-50 text-primary-blue font-medium" : "hover:bg-blue-50 hover:text-primary-blue"} p-3 pl-14`}>My Wishlist</Link>
                    </div>

                    <div className="flex items-center gap-5 px-4 py-4 border-b">
                        <span className="text-primary-blue"><PowerSettingsNewIcon /></span>
                        <div className="flex w-full justify-between font-medium text-gray-500 hover:text-primary-blue cursor-pointer" onClick={handleLogout}>
                            Logout
                            <span><ChevronRightIcon /></span>
                        </div>
                    </div>
                </div>

                {/* frequently visited */}
                <div className="flex flex-col items-start gap-2 p-4 bg-white rounded-sm shadow">
                    <span className="text-xs font-medium">Frequently Visited:</span>
                    <div className="flex gap-2.5 text-xs text-gray-500">
                        <Link to="/password/update">Change Password</Link>
                        <Link to="/orders">Track Order</Link>
                        <Link to="/">Help Center</Link>
                    </div>
                </div>
            </div>

            {/* ── Mobile tab bar (< lg): compact horizontal strip ── */}
            <div className="lg:hidden w-full bg-white shadow rounded-sm mb-2">
                {/* User info row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b">
                    <div className="w-9 h-9 rounded-full shrink-0">
                        <img
                            draggable="false"
                            className="h-full w-full object-cover rounded-full"
                            src={user?.avatar?.url || defaultAvatar}
                            alt="Avatar"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-gray-400">Hello,</p>
                        <p className="font-semibold text-sm truncate">{user?.name || "Guest"}</p>
                    </div>
                </div>
                {/* Tab row */}
                <div className="flex overflow-x-auto no-scrollbar divide-x divide-gray-100">
                    <Link
                        to="/orders"
                        className="flex flex-col items-center gap-1 px-5 py-3 text-xs text-gray-600 hover:text-primary-blue hover:bg-blue-50 shrink-0 transition-colors"
                    >
                        <FolderIcon sx={{ fontSize: "20px" }} />
                        Orders
                    </Link>
                    <Link
                        to="/account"
                        className={`flex flex-col items-center gap-1 px-5 py-3 text-xs shrink-0 transition-colors ${activeTab === "profile" ? "text-primary-blue bg-blue-50 font-medium" : "text-gray-600 hover:text-primary-blue hover:bg-blue-50"}`}
                    >
                        <PersonIcon sx={{ fontSize: "20px" }} />
                        Profile
                    </Link>
                    <Link
                        to="/wishlist"
                        className={`flex flex-col items-center gap-1 px-5 py-3 text-xs shrink-0 transition-colors ${activeTab === "wishlist" ? "text-primary-blue bg-blue-50 font-medium" : "text-gray-600 hover:text-primary-blue hover:bg-blue-50"}`}
                    >
                        <FolderSharedIcon sx={{ fontSize: "20px" }} />
                        Wishlist
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center gap-1 px-5 py-3 text-xs text-gray-600 hover:text-red-500 hover:bg-red-50 shrink-0 transition-colors"
                    >
                        <PowerSettingsNewIcon sx={{ fontSize: "20px" }} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
