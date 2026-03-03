import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import { useSnackbar } from 'notistack';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, registerUser } from '../../actions/userAction';
import BackdropLoader from '../Layouts/BackdropLoader';
import MetaData from '../Layouts/MetaData';
import FormSidebar from './FormSidebar';

const Register = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const { loading, isAuthenticated, error } = useSelector((state) => state.user);

    const [user, setUser] = useState({
        name: "",
        email: "",
        gender: "",
        mobileNumber: "",
        password: "",
        cpassword: "",
    });

    const { name, email, gender, mobileNumber, password, cpassword } = user;

    const handleRegister = (e) => {
        e.preventDefault();
        if (password.length < 8) {
            enqueueSnackbar("Password length must be atleast 8 characters", { variant: "warning" });
            return;
        }
        if (password !== cpassword) {
            enqueueSnackbar("Password Doesn't Match", { variant: "error" });
            return;
        }
        if (!/^\d{10}$/.test(mobileNumber)) {
            enqueueSnackbar("Please enter a valid 10-digit mobile number", { variant: "error" });
            return;
        }

        const formData = new FormData();
        formData.set("name", name);
        formData.set("email", email);
        formData.set("gender", gender);
        formData.set("mobileNumber", mobileNumber);
        formData.set("password", password);

        dispatch(registerUser(formData));
    }

    const handleDataChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    }

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        if (isAuthenticated) {
            navigate('/')
        }
    }, [dispatch, error, isAuthenticated, navigate, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Register | GlossyVibes" />

            {loading && <BackdropLoader />}
            <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-4">

                {/* <!-- row --> */}
                <div className="flex flex-col sm:flex-row w-full lg:w-4/5 m-auto mb-7 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden rounded-2xl">


                    <FormSidebar
                        title="Looks like you're new here!"
                        tag="Sign up with your mobile number to get started"
                    />

                    {/* <!-- signup column --> */}
                    <div className="flex-1 overflow-hidden">

                        {/* <!-- personal info procedure container --> */}
                        <form
                            onSubmit={handleRegister}
                            className="p-5 sm:p-10"
                        >
                            <div className="flex flex-col gap-4 items-start">

                                {/* <!-- input container column --> */}
                                <div className="flex flex-col w-full justify-between sm:flex-col gap-3 items-center">
                                    <TextField
                                        fullWidth
                                        id="full-name"
                                        label="Full Name"
                                        name="name"
                                        value={name}
                                        onChange={handleDataChange}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        id="email"
                                        label="Email"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={handleDataChange}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        id="mobile-number"
                                        label="Mobile Number"
                                        name="mobileNumber"
                                        value={mobileNumber}
                                        onChange={handleDataChange}
                                        required
                                        inputProps={{
                                            pattern: "\\d{10}",
                                            title: "Please enter a valid 10-digit mobile number"
                                        }}
                                    />
                                </div>

                                {/* <!-- gender input --> */}
                                <div className="flex gap-4 items-center">
                                    <h2 className="text-md">Your Gender :</h2>
                                    <div className="flex items-center gap-6" id="radioInput">
                                        <RadioGroup
                                            row
                                            aria-labelledby="radio-buttons-group-label"
                                            name="radio-buttons-group"
                                        >
                                            <FormControlLabel name="gender" value="male" onChange={handleDataChange} control={<Radio required />} label="Male" />
                                            <FormControlLabel name="gender" value="female" onChange={handleDataChange} control={<Radio required />} label="Female" />
                                        </RadioGroup>
                                    </div>
                                </div>

                                {/* <!-- input container column --> */}
                                <div className="flex flex-col w-full justify-between sm:flex-row gap-3 items-center">
                                    <TextField
                                        fullWidth
                                        id="password"
                                        label="Password"
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={handleDataChange}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        id="confirm-password"
                                        label="Confirm Password"
                                        type="password"
                                        name="cpassword"
                                        value={cpassword}
                                        onChange={handleDataChange}
                                        required
                                    />
                                </div>


                                <button type="submit" className="text-white py-3 w-full bg-primary-orange shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 rounded-xl font-medium mt-4">Signup</button>
                                <Link to="/login" className="hover:bg-gray-50 text-primary-gray-900 text-center py-3 w-full shadow-sm border border-gray-200 hover:border-gray-300 rounded-xl font-medium transition-all duration-300">Existing User? Log in</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Register;
