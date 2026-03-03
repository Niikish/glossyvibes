import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, loginUser } from '../../actions/userAction';
import { useSnackbar } from 'notistack';
import BackdropLoader from '../Layouts/BackdropLoader';
import MetaData from '../Layouts/MetaData';

const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const location = useLocation();

    const { loading, isAuthenticated, error } = useSelector((state) => state.user);

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        dispatch(loginUser(login, password));
    }

    const redirect = location.search ? location.search.split("=")[1] : "";

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (isAuthenticated) {
            navigate(redirect ? `/${redirect}` : '/');
        }
    }, [dispatch, error, isAuthenticated, redirect, navigate, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Login | GlossyVibes" />

            {loading && <BackdropLoader />}
            <main className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-10">

                {/* <!-- row --> */}
                <div className="flex flex-col sm:flex-row w-full max-w-4xl mx-auto mb-7 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden rounded-2xl">

                    {/* <!-- sidebar column  --> */}
                    <div className="loginSidebar bg-primary-blue p-10 pr-12 hidden lg:flex flex-col gap-4 w-2/5">
                        <h1 className="font-medium text-white text-3xl">Login</h1>
                        <p className="text-gray-200 text-lg text-pretty">Get access to your Orders, Wishlist and Recommendations</p>
                    </div>

                    {/* <!-- sidebar column  --> */}

                    {/* <!-- login column --> */}
                    <div className="flex-1 overflow-hidden">

                        {/* <!-- edit info container --> */}
                        <div className="text-center py-10 px-4 sm:px-14">

                            {/* <!-- input container --> */}
                            <form onSubmit={handleLogin}>
                                <div className="flex flex-col w-full gap-4">

                                    <TextField
                                        fullWidth
                                        id="login"
                                        label="Email or Mobile Number"
                                        value={login}
                                        onChange={(e) => setLogin(e.target.value)}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        id="password"
                                        label="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />

                                    {/* <!-- button container --> */}
                                    <div className="flex flex-col gap-2.5 mt-2 mb-4">
                                        <p className="text-xs text-primary-grey text-left">By continuing, you agree to GlossyVibes's <a href="/terms" className="text-primary-blue"> Terms of Use</a> and <a href="/privacy" className="text-primary-blue"> Privacy Policy.</a></p>
                                        <button type="submit" className="text-white py-3 w-full bg-primary-orange shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 rounded-xl font-medium">Login</button>
                                        <Link to="/password/forgot" className="hover:bg-gray-50 text-primary-gray-900 text-center py-3 w-full shadow-sm border border-gray-200 hover:border-gray-300 rounded-xl font-medium transition-all duration-300">Forgot Password?</Link>
                                    </div>
                                    {/* <!-- button container --> */}

                                </div>
                            </form>
                            {/* <!-- input container --> */}

                            <Link to="/register" className="font-medium text-sm text-primary-blue">New to GlossyVibes? Create an account</Link>
                        </div>
                        {/* <!-- edit info container --> */}

                    </div>
                    {/* <!-- login column --> */}
                </div>
                {/* <!-- row --> */}

            </main>
        </>
    );
};

export default Login;
