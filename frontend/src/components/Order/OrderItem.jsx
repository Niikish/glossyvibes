import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CircleIcon from '@mui/icons-material/Circle';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/functions';

const OrderItem = (props) => {

    const { orderId, name, image, price, quantity, createdAt, deliveredAt, orderStatus } = props;

    return (
        <Link to={`/order_details/${orderId}`} className="flex p-4 sm:p-6 items-start bg-white border border-gray-100 rounded-2xl gap-3 sm:gap-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 mb-4">
            {/* <!-- image container --> */}
            <div className="w-full sm:w-32 h-20">
                <img draggable="false" className="h-full w-full object-contain" src={image} alt={name} />
            </div>
            {/* <!-- image container --> */}

            {/* <!-- order desc container --> */}
            <div className="flex flex-col sm:flex-row justify-between w-full">

                <div className="flex flex-col gap-1 overflow-hidden">
                    <p className="text-sm">{name.length > 40 ? `${name.substring(0, 40)}...` : name}</p>
                    <p className="text-xs text-gray-500 mt-2">Quantity: {quantity}</p>
                    <p className="text-xs text-gray-500">Total: ₹{(quantity * price).toLocaleString()}</p>
                </div>

                <div className="flex flex-col sm:flex-row mt-1 sm:mt-0 gap-2 sm:gap-20 sm:w-1/2">
                    <p className="text-sm">₹{price.toLocaleString()}</p>

                    <div className="flex flex-col gap-1.5">
                        <p className="text-sm font-medium flex items-center gap-1">
                            {orderStatus === "Shipped" ? (
                                <>
                                    <span className="text-primary-orange pb-0.5">
                                        <CircleIcon sx={{ fontSize: "14px" }} />
                                    </span>
                                    Shipped
                                </>
                            ) : orderStatus === "Delivered" ? (
                                <>
                                    <span className="text-primary-green pb-0.5">
                                        <CircleIcon sx={{ fontSize: "14px" }} />
                                    </span>
                                    Delivered on {formatDate(deliveredAt)}
                                </>
                            ) : (
                                <>
                                    <span className="text-primary-green pb-0.5">
                                        <RadioButtonUncheckedIcon sx={{ fontSize: "14px" }} />
                                    </span>
                                    Ordered on {formatDate(createdAt)}
                                </>
                            )}
                        </p>
                        {orderStatus === "Delivered" ?
                            <p className="text-xs ml-1">Your item has been {orderStatus}</p>
                            : orderStatus === "Shipped" ?
                                <p className="text-xs ml-1">Your item has been {orderStatus}</p> :
                                <p className="text-xs ml-1">Seller has processed your order</p>
                        }

                        {/* 🧾 Quick Invoice Download */}
                        {props.invoiceUrl && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(props.invoiceUrl, '_blank');
                                }}
                                className="text-blue-600 hover:underline text-xs ml-1 mt-2 font-medium flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Download GST Invoice
                            </button>
                        )}
                    </div>
                </div>

            </div>
            {/* <!-- order desc container --> */}

        </Link>
    );
};

export default OrderItem;
