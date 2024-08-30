/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../components/shopcontext';

const Checkout = () => {
  const { resetCart } = useContext(ShopContext);
  const { totalAmount } = useParams();
  const [totalProducts, setTotalProducts] = useState(0);
  const userId = localStorage.getItem('user_id');
  const userCartId = localStorage.getItem('userCartId');
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });
  const [addresses, setAddresses] = useState([]);
  const [showAddress2, setShowAddress2] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [orderId, setOrderId] = useState(0)
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (userCartId) {
      fetch(`http://localhost:3007/cart/${userCartId}/items/count`)
        .then(response => response.json())
        .then(data => setTotalProducts(data.count));
    }

    if (userId) {
      fetch(`http://localhost:3001/user/${userId}`)
        .then(response => response.json())
        .then(data => setUserInfo({ username: data.username, email: data.email }));

      fetch(`http://localhost:3001/user/${userId}/address`)
        .then(response => response.json())
        .then(data => setAddresses(data.address));
    }
  }, [userCartId, userId]);

  const handleAddAddress = () => {
    fetch(`http://localhost:3001/user/${userId}/address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: newAddress }),
    })
      .then(response => response.json())
      .then(data => {
        setAddresses([...addresses, data.address]);
        setShowAddress2(false);
        setNewAddress('');
      })
      .catch(error => console.error('Error adding address:', error));
  };

  const handlePay = () => {
    // Create the order
    fetch(`http://localhost:3009/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id : userId,
        total_amount : totalAmount
      }),
    }).then(response => response.json())
    .then(data => setOrderId(data.id))
    
    // Fetch cart items
    fetch(`http://localhost:3007/cart/${userCartId}/items`)
    .then(response => response.json())
    .then(data => setCartItems(data))

    // Add items to the order
    cartItems.forEach(item => {
      fetch(`http://localhost:3009/orders/${orderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id : item.product_id,
          quantity : item.quantity,
          unit_price : item.unit_price
        }),
      })
     .then(response => response.json())
     .then(data => console.log('Item added to order:', data))
     .catch(error => console.error('Error adding item to order:', error));
    });

    // reduce stock 
    cartItems.forEach(item => {
      fetch(`http://localhost:3003/product/${item.product_id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: item.stock - item.quantity }),
      })
     .then(response => response.json())
     .then(data => console.log('Stock updated:', data))
     .catch(error => console.error('Error updating stock:', error));
    });
      
    // Clear the cart
    fetch(`http://localhost:3007/cart/${userCartId}/items`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    }).then(response => response.json())

    //alert 
    alert(`Order placed successfully. Your order ID is ${orderId}`);
        
  };

  return (
    <section className="checkout p-5">
      <div className="container-xxl">
        <div className="row">
          <div className="col-md-6 p-2">
            <h1 className="mt-3 mb-3 fs-3">Fill the following details for shipping.</h1>
            <form className="row g-3 mb-3" onSubmit={(e) => e.preventDefault()}>
              <div className="col-md-6">
                <label htmlFor="inputUsername" className="form-label">Username</label>
                <input type="text" className="form-control" id="inputUsername" value={userInfo.username} readOnly />
              </div>

              <div className="col-md-6">
                <label htmlFor="inputEmail" className="form-label">Email</label>
                <input type="email" className="form-control" id="inputEmail" value={userInfo.email} readOnly />
              </div>

              <div className="col-12">
                <label htmlFor="inputAddress" className="form-label">Address</label>
                <input type="text" className="form-control" id="inputAddress" value={addresses[0]} readOnly />
              </div>

              {addresses.length === 1 && !showAddress2 && (
                <div className="col-12 mt-3">
                  <button type="button" onClick={() => setShowAddress2(true)} className="btn btn-outline-primary">+</button>
                </div>
              )}

              {showAddress2 && (
                <>
                  <div className="col-12">
                    <label htmlFor="inputAddress2" className="form-label">Address 2</label>
                    <input
                      type="text"
                      className="form-control"
                      id="inputAddress2"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                  </div>
                  <div className="col-12 mt-3">
                    <button type="button" onClick={handleAddAddress} className="btn btn-success">✔</button>
                    <button type="button" onClick={() => setShowAddress2(false)} className="btn btn-danger">✖</button>
                  </div>
                </>
              )}

              <div className="col-12 mt-5">
                <button type="submit" onClick={handlePay} className="btn btn-primary">Proceed To Pay</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
