/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { createContext, useState } from 'react'
import { PRODUCTS, PRODUCTS1 } from '../components/products';
// context
export const ShopContext = createContext(null);
// function

const shopcontext = (props) => {
  //get the userCartId from the local storage
  const cartId = localStorage.getItem('userCartId') || null;
  const [cartItems, setCartItems] = useState([]);

  //get all the items in the cart
  const getCartItems = () => {
    fetch(`http://localhost:3007/cart/${cartId}/items`)
    .then(response => response.json())
    .then(data => setCartItems(data))
    .catch(error => console.error('Failed to fetch cart items', error));

    return data;
  }

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for(const item of cartItems) {
      totalAmount += item?.total_price;
    }
    return totalAmount;
  };

  const getTotalCartProducts = () => {
    let totalProducts = 0;
    for (const item of cartItems) {
      totalProducts += item.quantity;
    }
    return totalProducts;
  };

  const addToCart = (product_id, quantity, unit_price) => {
    if(cartId){
      fetch(`http://localhost:3007/cart/${cartId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id, quantity, unit_price }),
      })
      .then(response => {
        if(response.ok) {
          getCartItems();
        } else {
          throw new Error('Failed to add item to cart');
        }
      })
      .catch(error => console.error('Failed to add item to cart', error));
    } else {
      alert('Must be connected to shop');
      window.location.href = '/login';
    }
  };

  const removeToCart = (product_id) => {
    if(cartId){
      fetch(`http://localhost:3007/cart/${cartId}/items/${product_id}`, {
        method: 'DELETE',
      })
      .then(response => {
        if(response.ok) {
          getCartItems();
        } else {
          throw new Error('Failed to remove item from cart');
        }
      })
      .catch(error => console.error('Failed to remove item from cart', error));
    } else {
      window.location.href = '/login';
    }
  };

  const updateCartItemCount = (product_id, newQuantity) => {
    if(cartId){
      fetch(`http://localhost:3007/cart/${cartId}/items/${product_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      .then(response => {
        if(response.ok) {
          getCartItems();
        } else {
          throw new Error('Failed to update item quantity');
        }
      })
      .catch(error => console.error('Failed to update item quantity', error));
    } else {
      window.location.href = '/login';
    }
  };

  const clearCart = () => {
    if(cartId){
      fetch(`http://localhost:3007/cart/${cartId}/items`, {
        method: 'DELETE',
      })
      .then(response => {
        if(response.ok) {
          setCartItems([]);
        } else {
          throw new Error('Failed to clear cart');
        }
      })
      .catch(error => console.error('Failed to clear cart', error));
    }
  };

  const [selectedProduct, setSelectedProduct] = useState(null);

  const viewProductDetails = (product_id) => {
    setSelectedProduct(product_id);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const contextValue = {
    cartItems,
    addToCart,
    removeToCart,
    updateCartItemCount,
    getTotalCartAmount,
    getTotalCartProducts,
    clearCart,
    viewProductDetails,
    closeProductDetails,
    selectedProduct,
  };

  

  return (
    <ShopContext.Provider value={contextValue}>
      {props?.children}
    </ShopContext.Provider>
  );
};

export default shopcontext;
