import React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatIcon from '@mui/icons-material/Chat';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { logoutUser } from '../../../actions/userAction';

const PrimaryDropDownMenu = ({ setTogglePrimaryDropDown, user }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const { wishlistItems } = useSelector((state) => state.wishlist);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/login");
        enqueueSnackbar("Logout Successfully", { variant: "success" });
        setTogglePrimaryDropDown(false);
    }

    const navs = [
        // {
        //     title: "Supercoin Zone",
        //     icon: <OfflineBoltIcon sx={{ fontSize: "18px" }} />,
        //     redirect: "/",
        // },
        // {
        //     title: "Flipkart Plus Zone",
        //     icon: <AddCircleIcon sx={{ fontSize: "18px" }} />,
        //     redirect: "/",
        // },
        {
            title: "Orders",
            icon: <ShoppingBagIcon sx={{ fontSize: "18px" }} />,
            redirect: "/orders",
        },
        {
            title: "Wishlist",
            icon: <FavoriteIcon sx={{ fontSize: "18px" }} />,
            redirect: "/wishlist",
        },
        {
            title: "My Chats",
            icon: <ChatIcon sx={{ fontSize: "18px" }} />,
            redirect: "/",
        },
        // {
        //     title: "Coupons",
        //     icon: <ConfirmationNumberIcon sx={{ fontSize: "18px" }} />,
        //     redirect: "/",
        // },
        // {
        //     title: "Gift Cards",
        //     icon: <AccountBalanceWalletIcon sx={{ fontSize: "18px" }} />,
        //     redirect: "/",
        // },
        // {
        //     title: "Notifications",
        //     icon: <NotificationsIcon sx={{ fontSize: "18px" }} />,
        //     redirect: "/",
        // },
    ]

    return (
        <div className="primaryDropDown absolute w-60 -left-24 ml-2 top-9 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)] rounded-2xl flex-col text-sm border border-gray-100 overflow-hidden">


            {user.role === "admin" &&
                <Link
                    className="pl-3 py-3.5 border-b flex gap-3 items-center hover:bg-gray-50 rounded-t"
                    to="/admin/dashboard"
                    onClick={() => setTogglePrimaryDropDown(false)}
                >
                    <span className="text-primary-blue"><DashboardIcon sx={{ fontSize: "18px" }} /></span>
                    Admin Dashboard
                </Link>
            }

            <Link
                className="pl-3 py-3.5 border-b flex gap-3 items-center hover:bg-gray-50 rounded-t"
                to="/account"
                onClick={() => setTogglePrimaryDropDown(false)}
            >
                <span className="text-primary-blue"><AccountCircleIcon sx={{ fontSize: "18px" }} /></span>
                My Profile
            </Link>

            {navs.map((item, i) => {
                const { title, icon, redirect } = item;

                return (
                    title === "Wishlist" ? (
                        <Link
                            className="pl-3 py-3.5 border-b flex gap-3 items-center hover:bg-gray-50"
                            to={redirect}
                            key={i}
                            onClick={() => setTogglePrimaryDropDown(false)}
                        >
                            <span className="text-primary-blue">{icon}</span>
                            {title}
                            <span className="ml-auto mr-3 bg-gray-100 p-0.5 px-2 text-gray-600 rounded">
                                {wishlistItems.length}
                            </span>
                        </Link>
                    ) : (
                        <Link
                            className="pl-3 py-3.5 border-b flex gap-3 items-center hover:bg-gray-50"
                            to={redirect}
                            key={i}
                            onClick={() => setTogglePrimaryDropDown(false)}
                        >
                            <span className="text-primary-blue">{icon}</span>
                            {title}
                        </Link>
                    )
                )
            })}

            <div className="pl-3 py-3.5 flex gap-3 items-center hover:bg-gray-50 rounded-b cursor-pointer" onClick={handleLogout} >
                <span className="text-primary-blue"><PowerSettingsNewIcon sx={{ fontSize: "18px" }} /></span>
                Logout
            </div>

            <div className="absolute right-1/2 -top-2.5">
                <div className="arrow_down"></div>
            </div>
        </div>
    );
};

export default PrimaryDropDownMenu;
