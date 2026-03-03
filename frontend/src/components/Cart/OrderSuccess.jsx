import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MetaData from '../Layouts/MetaData';
import successfull from '../../assets/images/Transaction/success.png';
import failed from '../../assets/images/Transaction/failed.png';

const OrderSuccess = ({ success = true }) => {  // Default success to true for COD orders

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [time, setTime] = useState(3);

    useEffect(() => {
        // Coupon redemption is now handled in Payment.jsx
    }, [success, dispatch]);

    useEffect(() => {
        if (time === 0) {
            if (success) {
                navigate("/orders")
            } else {
                navigate("/cart")
            }
            return;
        };
        const intervalId = setInterval(() => {
            setTime(time - 1);
        }, 1000);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line
    }, [time]);

    return (
        <>
            <MetaData title={`Order ${success ? "Successful" : "Failed"}`} />

            <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-4">
                {/* <!-- row --> */}
                <div className="flex flex-col gap-4 items-center justify-center w-full lg:w-3/4 mx-auto mb-7 bg-white shadow rounded p-6 pb-12">
                    <img draggable="false" className="w-full max-w-[200px] h-auto object-contain" src={success ? successfull : failed} alt="Order Status" />

                    <h1 className="text-2xl font-semibold">Order {success ? "Placed Successfully" : "Failed"}</h1>
                    <p className="mt-4 text-lg text-gray-800">Redirecting to {success ? "orders" : "cart"} in {time} sec</p>
                    <Link to={success ? "/orders" : "/cart"} className="bg-primary-blue mt-2 py-2.5 px-6 text-white uppercase shadow hover:shadow-lg rounded-sm">go to {success ? "orders" : "cart"}</Link>
                </div>
                {/* <!-- row --> */}
            </main>
        </>
    );
};

export default OrderSuccess;
