import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../Layouts/Loader';
import MinCategory from '../Layouts/MinCategory';
import MetaData from '../Layouts/MetaData';

const Account = () => {

    const navigate = useNavigate();

    const { user, loading, isAuthenticated } = useSelector(state => state.user)

    useEffect(() => {
        if (isAuthenticated === false) {
            navigate("/login")
        }
    }, [isAuthenticated, navigate]);

    const getLastName = () => {
        if (!user || !user.name) return '';
        const nameArray = user.name.split(" ");
        return nameArray.length > 1 ? nameArray[nameArray.length - 1] : '';
    }

    const getFirstName = () => {
        if (!user || !user.name) return '';
        return user.name.split(" ")[0] || '';
    }

    return (
        <>
            <MetaData title="My Profile" />

            {loading ? <Loader /> : (
                <>
                    <MinCategory />
                    <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 sm:mt-24">

                        {/* <!-- row --> */}
                        <div className="flex flex-col lg:flex-row gap-4 mb-7">


                            <Sidebar activeTab={"profile"} />

                            {/* <!-- details column --> */}
                            <div className="flex-1 overflow-hidden shadow bg-white">
                                {/* <!-- edit info container --> */}
                                <div className="flex flex-col gap-12 m-4 sm:mx-8 sm:my-6">
                                    {/* <!-- personal info --> */}
                                    <div className="flex flex-col gap-5 items-start">
                                        <span className="font-medium text-lg">Personal Information <Link to="/account/update" className="text-sm text-primary-blue font-medium ml-8 cursor-pointer">Edit</Link></span>

                                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full" id="personalInputs">
                                            <div className="flex flex-col gap-0.5 w-full sm:w-64 px-3 py-1.5 rounded-sm border inputs cursor-not-allowed bg-gray-100 focus-within:border-primary-blue">
                                                <label className="text-xs text-gray-500">First Name</label>
                                                <input type="text" value={getFirstName()} className="text-sm outline-none border-none cursor-not-allowed text-gray-500" disabled />
                                            </div>
                                            <div className="flex flex-col gap-0.5 w-full sm:w-64 px-3 py-1.5 rounded-sm border inputs cursor-not-allowed bg-gray-100 focus-within:border-primary-blue">
                                                <label className="text-xs text-gray-500">Last Name</label>
                                                <input type="text" value={getLastName()} className="text-sm outline-none border-none cursor-not-allowed text-gray-500" disabled />
                                            </div>
                                        </div>


                                        {/* <!-- gender --> */}
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-sm">Your Gender</h2>
                                            <div className="flex items-center gap-8" id="radioInput">
                                                <div className="flex items-center gap-4 inputs text-gray-500 cursor-not-allowed">
                                                    <input type="radio" name="gender" checked={user?.gender === "male"} id="male" className="h-4 w-4 cursor-not-allowed" disabled />
                                                    <label htmlFor="male" className="cursor-not-allowed">Male</label>
                                                </div>
                                                <div className="flex items-center gap-4 inputs text-gray-500 cursor-not-allowed">
                                                    <input type="radio" name="gender" checked={user?.gender === "female"} id="female" className="h-4 w-4 cursor-not-allowed" disabled />
                                                    <label htmlFor="female" className="cursor-not-allowed">Female</label>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <!-- gender --> */}

                                    </div>
                                    {/* <!-- personal info --> */}

                                    {/* <!-- email address info --> */}
                                    <div className="flex flex-col gap-5 items-start">
                                        <span className="font-medium text-lg">Email Address
                                            <Link to="/account/update" className="text-sm text-primary-blue font-medium ml-3 sm:ml-8 cursor-pointer">Edit</Link>
                                            <Link to="/password/update" className="text-sm text-primary-blue font-medium ml-3 sm:ml-8">Change Password</Link>
                                        </span>

                                        <div className="flex items-center gap-3 w-full">
                                            <div className="flex flex-col gap-0.5 w-full sm:w-64 px-3 py-1.5 rounded-sm border bg-gray-100 cursor-not-allowed focus-within:border-primary-blue">
                                                <label className="text-xs text-gray-500">Email Address</label>
                                                <input type="email" value={user?.email || ''} className="text-sm outline-none border-none cursor-not-allowed text-gray-500" disabled />
                                            </div>
                                        </div>


                                    </div>
                                    {/* <!-- email address info --> */}

                                    {/* <!-- mobile number info --> */}
                                    <div className="flex flex-col gap-5 items-start">
                                        <span className="font-medium text-lg">Mobile Number
                                            <span className="text-sm text-primary-blue font-medium ml-3 sm:ml-8 cursor-pointer" id="mobEditBtn">Edit</span>
                                        </span>

                                        <div className="flex items-center gap-3 w-full">
                                            <div className="flex flex-col gap-0.5 w-full sm:w-64 px-3 py-1.5 rounded-sm border bg-gray-100 cursor-not-allowed focus-within:border-primary-blue">
                                                <label className="text-xs text-gray-500">Mobile Number</label>
                                                <input type="tel" value={user?.mobileNumber || ''} className="text-sm outline-none border-none text-gray-500 cursor-not-allowed" disabled />
                                            </div>
                                        </div>


                                    </div>
                                    {/* <!-- mobile number info --> */}

                                    {/* <!-- faqs --> */}
                                    <div className="flex flex-col gap-4 mt-4">
                                        <span className="font-medium text-lg mb-2">FAQs</span>
                                        <h4 className="text-sm font-medium">What happens when I update my email address?</h4>
                                        <p className="text-sm text-gray-600">Your login email address is updated immediately. You'll receive all account-related communications at your new email address going forward.</p>

                                        <h4 className="text-sm font-medium">When will my GlossyVibes account reflect the new email address?</h4>
                                        <p className="text-sm text-gray-600">As soon as you save the changes, your account will be updated with the new email address.</p>

                                        <h4 className="text-sm font-medium">Will my order history be preserved after updating my profile?</h4>
                                        <p className="text-sm text-gray-600">Yes — updating your profile details does not affect your order history, saved addresses, or wishlist. Everything stays intact.</p>

                                        <h4 className="text-sm font-medium">What should I do if I forget my password?</h4>
                                        <p className="text-sm text-gray-600">Use the "Forgot Password" link on the login page. We'll send a reset link to your registered email address.</p>

                                    </div>
                                    {/* <!-- faqs --> */}

                                    {/* <!-- deactivate account --> */}
                                    <Link className="text-sm text-primary-blue font-medium" to="/">Deactivate Account</Link>
                                    {/* <!-- deactivate account --> */}
                                </div>
                                {/* <!-- edit info container --> */}

                                <div className="border-t mt-4 pt-4 text-center text-xs text-gray-400">
                                    <p>✨ Thank you for being a valued GlossyVibes member!</p>
                                </div>
                            </div>
                            {/* <!-- details column --> */}
                        </div>
                    </main>
                </>
            )}
        </>
    );
};

export default Account;
