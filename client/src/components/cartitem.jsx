import React, { useEffect, useState } from 'react';
import { RiDeleteBack2Line } from 'react-icons/ri';

const CartItem = (props) => {
    const { product_id, quantity: initialQuantity } = props.data;
    const [product, setProduct] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [category, setCategory] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [quantity, setQuantity] = useState(initialQuantity);
    const [showUpdateButton, setShowUpdateButton] = useState(false);
    
    useEffect(() => {
      fetch(`http://localhost:3003/products/${product_id}`)
        .then(response => response.json())
        .then(data => setProduct(data))
        .catch(error => console.error('Failed to fetch product', error));
    }, [product_id]);

    useEffect(() => {
      fetch(`http://localhost:3003/products/${product_id}/images`)
        .then(response => response.json())
        .then(data => setProductImages(data))
        .catch(error => console.error('Failed to fetch product images', error));
    }, [product_id]);

    useEffect(() => {
      if (product) {
        fetch(`http://localhost:3005/categories/${product.category_id}`)
          .then(response => response.json())
          .then(data => setCategory(data.name));

        fetch(`http://localhost:3005/sub_categories/${product.subcategory_id}`)
          .then(response => response.json())
          .then(data => setSubcategory(data.name));
      }
    }, [product]);

    const handleQuantityChange = (newQuantity) => {
        setQuantity(newQuantity);
        if (newQuantity !== initialQuantity) {
            setShowUpdateButton(true);
        } else {
            setShowUpdateButton(false);
        }
    };

    const handleUpdate = () => {
        const cartId = localStorage.getItem('userCartId');
        fetch(`http://localhost:3007/cart/${cartId}/items/${product_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Quantity updated:', data);
            setShowUpdateButton(false);  // Hide update button after successful update
        })
        .catch(error => console.error('Failed to update quantity', error));
    };

    if (!product) return null; // Don't render anything until the product is fetched

    return (
        <div className="container card my-3">
            <div className="row g-3">
                <div className="col-12 col-md-5">
                    <div className="p-3">
                        <div className="cart-item-image m-auto">
                            <img src={productImages[0]?.image_path} className="card-img-top img-fluid" alt="..." />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-7">
                    <div className="p-3">
                        <h2>{product.name}</h2>
                        <p className="cart-item-id">Product Category: <b className='text-center mb-1'>{category}</b></p>
                        <p className="cart-item-id">Product SubCategory: <b className='text-center mb-1'>{subcategory}</b></p>
                        <p className="cart-item-id">Product Price: <b className='text-center mb-1'>${product.price}</b></p>
                        <p className="cart-item-id">Product Number: <b className='text-center mb-3'>{product.id}</b></p>
                    </div>
                    <div className="p-3 d-flex justify-content-between align-items-center">
                        <div className="count-handler">
                            <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(quantity + 1)}>+</button>
                            <input
                                className='text-danger fs-4 form-control'
                                value={quantity}
                                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                            />
                            <button className="btn btn-outline-secondary" onClick={() => handleQuantityChange(quantity - 1)}>-</button>
                        </div>
                        <button className="btn btn-outline-danger" onClick={() => removeFromCart(product_id)}>
                            <RiDeleteBack2Line />
                        </button>
                    </div>
                    {showUpdateButton && (
                        <div className="p-3">
                            <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
                        </div>
                    )}
                    <div className="p-3">
                        <input type="text" className="form-control" id="coupon" placeholder="Enter coupon code..." />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartItem;
