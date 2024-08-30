/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useContext, useState } from 'react';
import { ShopContext } from './shopcontext';
import ReactStars from 'react-rating-stars-component';
import { Link } from 'react-router-dom';

const Prod = (props) => {
  const { id, name, price, image, category, subcategory } = props.data;
  const { addToCart, cartItems, viewProductDetails } = useContext(ShopContext);

  const cartItemAmount = cartItems[id];
  const [inputVisible, setInputVisible] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Ensure the input is a strictly positive number
    if (/^\d+$/.test(value) && parseInt(value) > 0) {
      setQuantity(value);
    } else if (value === '') {
      setQuantity('');
    }
    console.log(quantity);
  };

  const handleAddToCart = () => {
    if (quantity) {
      addToCart(id, quantity, price); // Pass the product ID, quantity, and price
      setInputVisible(false);
      setQuantity('');
    } else {
      alert('Please enter a strictly positive number');
    }
  };

  return (
    <div className="col mb-5">
      <Link key={id} className="card h-100 m-auto">
        <img src={image} className="card-img-top img-fluid" alt="..." />
        <div className="card-body">
          <p className="card-text mb-2">{category}</p>
          <p className="card-text mb-2">{subcategory}</p>
          <h5>{name} </h5>
          <ReactStars
            count={5}
            edit={false}
            value={4}
            size={24}
            activeColor="#EA9D5A"
          />
          <div className="mb-3">
            <p className="price mb-2">
              <span className="red">{price}</span>&nbsp;
              <strike>{price * 2}$</strike>
            </p>
            <Link to={`/details/${id}`} onClick={() => viewProductDetails(id)}>
              <p className="text-center">
                <button className="fs-4" id="clear-cart">
                  View Details
                </button>
              </p>
            </Link>
          </div>
          <div className="d-flex justify-content-center">
            <button
              onClick={() => {
                setInputVisible(!inputVisible);
                event.target.classList.toggle('red');
              }}
              className="myButton"
            >
              Add To Cart
              {cartItemAmount > 0 && `(${cartItemAmount})`}
            </button>
          </div>

          {inputVisible && (
            <div className="d-flex justify-content-center mt-3">
              <input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                className="form-control"
                style={{ width: '100px' }}
              />
              <button onClick={handleAddToCart} className="btn btn-primary ms-2">
                Confirm
              </button>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Prod;
