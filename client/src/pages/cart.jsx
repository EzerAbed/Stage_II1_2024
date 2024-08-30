import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/cartitem';

const Cart = (props) => {
    const cartId = localStorage.getItem('userCartId') || null;
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    let totalAmount = 0;

    useEffect(() => {
        if (cartId) {
            fetch(`http://localhost:3007/cart/${cartId}/items`)
                .then(response => response.json())
                .then(data => setCartItems(data))
                .catch(error => console.error('Failed to fetch cart items', error));
        }
    }, []);

    if (cartItems.length > 0) {
        for (const item of cartItems) {
            totalAmount += item.total_price;
        }
    }

    const handleDelete = (product_id) => {
        if (cartId) {
            fetch(`http://localhost:3007/cart/${cartId}/items/${product_id}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        setCartItems(cartItems.filter(item => item.product_id !== product_id));
                    } else {
                        throw new Error('Failed to remove item from cart');
                    }
                })
                .catch(error => console.error('Failed to remove item from cart', error));
        }
    };

    const handleResize = () => {
        if (window.innerWidth < 576) {
            setIsMobile(true);
        } else {
            setIsMobile(false);
        }
    };

    window.addEventListener("resize", handleResize);

    return (
        <section className="cart">
            <div className="container-xxl p-5">
                {totalAmount > 0 ? (
                    <div className="row">
                        <div className='p-2 text-center'>
                            <h2>Cart</h2>
                        </div>
                        <div className="col-12 col-md-5 text-center">
                            <h5>Product</h5>
                        </div>
                        <div className="col-12 col-md-5 text-center">
                            <h5>Details</h5>
                        </div>

                        <div className="p-3">
                        {cartItems.map((item) => {
                            return <CartItem key={item.product_id} data={item} />;
                          })}
                            <div className='col-12 p-2 text-end'>
                                <button onClick={() => setCartItems([])} id='clear-cart'> Clear Cart </button>
                            </div>

                            <hr />
                            <div className="row">
                                <div className="col-12 col-md-6 d-flex m-auto justify-content-center mt-4">
                                    <button onClick={() => navigate("/shop")}>
                                        {isMobile ? "Continue" : "Continue Shopping"}
                                    </button>
                                </div>

                                <div className="col-12 col-md-6 total m-auto d-flex flex-column p-5">
                                    <div className="col-12">
                                        <div className="text-end">
                                            <h2 className="mb-3">
                                                <b>Total</b>
                                            </h2>
                                            <div className="align-items-center">
                                                <div>
                                                    <p className="total-price align-items-center">
                                                        <b>{totalAmount} DT</b>
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/checkout/${totalAmount}`)}
                                                className="mt-5"
                                            >
                                                {isMobile ? "Check Out" : "Proceed to Checkout"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="container-xxl">
                        <div className="row">
                            <div className="text-center p-5 mb-4">
                                <h2>Your Cart Is Empty!!!</h2>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Cart;
