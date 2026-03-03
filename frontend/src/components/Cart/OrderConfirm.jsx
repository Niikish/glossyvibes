import { useSelector } from 'react-redux';
import CartItem from './CartItem';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layouts/MetaData';

const OrderConfirm = () => {

    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);

    return (
        <>
            <MetaData title="Flipkart: Order Confirmation" />

            <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-4">

                {/* <!-- row --> */}
                <div className="flex flex-col lg:flex-row gap-4 mb-7">


                    {/* <!-- cart column --> */}
                    <div className="flex-1">

                        <Stepper activeStep={2}>
                            <div className="w-full bg-white">
                                {cartItems?.map((item, i) => (
                                    <CartItem {...item} inCart={false} key={i} />
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 bg-white px-4 sm:px-6 py-4 rounded-b-sm gap-4">
                                <p className="text-sm text-center sm:text-left">Order confirmation email will be sent to <span className="font-medium break-all">{user.email}</span></p>
                                <button onClick={() => { navigate('/process/payment') }} className="bg-primary-orange w-full sm:w-auto px-12 py-3 text-white font-medium rounded-sm shadow hover:shadow-lg uppercase tracking-wider">continue</button>
                            </div>

                        </Stepper>
                    </div>

                    <PriceSidebar cartItems={cartItems} />
                </div>
            </main>
        </>
    );
};

export default OrderConfirm;
