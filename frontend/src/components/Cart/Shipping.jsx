import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';
import { useSnackbar } from 'notistack';
import { saveShippingInfo } from '../../actions/cartAction';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layouts/MetaData';
import states from '../../utils/states';

const Shipping = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const { cartItems } = useSelector((state) => state.cart);
    const { shippingInfo } = useSelector((state) => state.cart);

    const [address, setAddress] = useState(shippingInfo.address || '');
    const [city, setCity] = useState(shippingInfo.city || '');
    const country = 'IN';
    const [state, setState] = useState(shippingInfo.state || '');
    const [pincode, setPincode] = useState(shippingInfo.pincode || '');
    const [phoneNo, setPhoneNo] = useState(shippingInfo.phoneNo || '');

    // Pincode Detection State
    const [isDetecting, setIsDetecting] = useState(false);
    const [locationError, setLocationError] = useState('');
    const abortControllerRef = useRef(null);
    const lastDetectedPincodeRef = useRef('');

    useEffect(() => {
        const fetchLocation = async () => {
            if (!pincode || pincode.length !== 6) {
                setLocationError('');
                return;
            }

            // Don't refetch if same pincode was just detected successfully
            if (pincode === lastDetectedPincodeRef.current) return;

            // Cancel previous request if any
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setIsDetecting(true);
            setLocationError('');

            try {
                const response = await fetch(`/api/v1/location/pincode/${pincode}`, {
                    signal: abortControllerRef.current.signal
                });

                const data = await response.json();

                if (data.success) {
                    // Match State Code against India states list
                    const stateObj = states.find(s => s.name.toLowerCase() === data.state.toLowerCase());

                    setCity(data.city); // Auto fill city
                    if (stateObj) setState(stateObj.code); // Auto fill state code

                    lastDetectedPincodeRef.current = pincode;
                    enqueueSnackbar("Location detected automatically!", { variant: "success", autoHideDuration: 2000 });
                } else {
                    setLocationError(data.message || "Invalid Pincode");
                    lastDetectedPincodeRef.current = ''; // Reset on invalid
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Pincode detection error:", error);
                    setLocationError("Service unavailable. Please enter manually.");
                }
            } finally {
                setIsDetecting(false);
            }
        };

        const timer = setTimeout(() => {
            fetchLocation();
        }, 400); // 400ms debounce

        return () => {
            clearTimeout(timer);
        };
        // eslint-disable-next-line
    }, [pincode]);

    const shippingSubmit = (e) => {
        e.preventDefault();

        if (phoneNo.length < 10 || phoneNo.length > 10) {
            enqueueSnackbar("Invalid Phone Number", { variant: "error" });
            return;
        }
        dispatch(saveShippingInfo({ address, city, country, state, pincode, phoneNo }));
        navigate("/order/confirm");
    }

    return (
        <>
            <MetaData title="Flipkart: Shipping Details" />
            <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-4">

                {/* <!-- row --> */}
                <div className="flex flex-col lg:flex-row gap-4 mb-7">


                    {/* <!-- cart column --> */}
                    <div className="flex-1">

                        <Stepper activeStep={1}>
                            <div className="w-full bg-white">

                                <form onSubmit={shippingSubmit} autoComplete="off" className="flex flex-col justify-start gap-4 w-full sm:w-3/4 px-4 sm:px-8 my-4">


                                    <TextField
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        fullWidth
                                        label="Address"
                                        variant="outlined"
                                        required
                                    />

                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        <div className="w-full relative">
                                            <TextField
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value)}
                                                type="number"
                                                label="Pincode"
                                                fullWidth
                                                variant="outlined"
                                                required
                                                error={Boolean(locationError)}
                                                helperText={locationError || (isDetecting ? "Detecting location..." : "")}
                                                InputProps={{
                                                    endAdornment: isDetecting ? <CircularProgress size={20} color="primary" /> : null
                                                }}
                                            />
                                        </div>
                                        <TextField
                                            value={phoneNo}
                                            onChange={(e) => setPhoneNo(e.target.value)}
                                            type="number"
                                            label="Phone No"
                                            fullWidth
                                            variant="outlined"
                                            required
                                        />
                                    </div>


                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        <TextField
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            label="City"
                                            fullWidth
                                            variant="outlined"
                                            required
                                            disabled={isDetecting}
                                        />
                                        <TextField
                                            label="Landmark (Optional)"
                                            fullWidth
                                            variant="outlined"
                                        />
                                    </div>


                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">

                                        <FormControl fullWidth>
                                            <InputLabel id="country-select">Country</InputLabel>
                                            <Select
                                                labelId="country-select"
                                                id="country-select"
                                                defaultValue={country}
                                                disabled
                                                label="Country"
                                            >
                                                <MenuItem value={'IN'}>India</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth disabled={country ? false : true}>
                                            <InputLabel id="state-select">State</InputLabel>
                                            <Select
                                                labelId="state-select"
                                                id="state-select"
                                                value={state}
                                                label="State"
                                                onChange={(e) => setState(e.target.value)}
                                                required
                                                disabled={isDetecting}
                                            >
                                                {states.map((item) => (
                                                    <MenuItem key={item.code} value={item.code}>{item.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                    </div>


                                    <button type="submit" className="bg-primary-orange w-full sm:w-1/3 my-2 py-3.5 text-sm font-medium text-white shadow hover:shadow-lg rounded-sm uppercase sticky bottom-0 sm:static">save and deliver here</button>

                                </form>
                            </div>
                        </Stepper>
                    </div>

                    <PriceSidebar cartItems={cartItems} />
                </div>
            </main>
        </>
    );
};

export default Shipping;
