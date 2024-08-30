import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from './shopcontext';
import { PRODUCTS } from './products';
import { useParams } from 'react-router-dom';

// Star rating component
const StarRating = ({ rating }) => {
  const stars = Array(5).fill(false).map((_, i) => i < rating);
  return (
    <div className="d-flex">
      {stars.map((filled, index) => (
        <span key={index} className={`bi bi-star${filled ? '-fill' : ''}`}></span>
      ))}
    </div>
  );
};

// Component for displaying a product card
const ProductCard = ({ product }) => (
  <div className="col-lg-3 col-md-6 mb-4">
    <div className="card">
      <img src={product.image} alt={product.name} className="card-img-top img-fluid" />
      <div className="card-body">
        <h5 className="card-title">{product.brand}</h5>
        <p className="card-text">{product.name}</p>
        <p className="card-text text-danger fs-4">{product.price}$</p>
        <button className="btn btn-primary">View Details</button>
      </div>
    </div>
  </div>
);

const ProductDetails = () => {
  const { selectedProduct, addToCart, cartItems, removeToCart, updateCartItemCount } = useContext(ShopContext);
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [productImage, setProductImage] = useState([]);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); // To store current user's ID

  useEffect(() => {
    // Fetch current user ID from local storage
    const userId = localStorage.getItem('user_id');
    setCurrentUserId(userId);

    const fetchData = async () => {
      try {
        // Fetch product information
        const productResponse = await fetch(`http://localhost:3003/products/${id}`);
        const productData = await productResponse.json();
        setProduct(productData);

        // Fetch product images
        const imagesResponse = await fetch(`http://localhost:3003/products/${id}/images`);
        const imagesData = await imagesResponse.json();
        setProductImage(imagesData);

        // Fetch product category
        const categoryResponse = await fetch(`http://localhost:3005/categories/${productData.category_id}`);
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        // Fetch product subcategory
        const subcategoryResponse = await fetch(`http://localhost:3005/sub_categories/${productData.subcategory_id}`);
        const subcategoryData = await subcategoryResponse.json();
        setSubcategory(subcategoryData);

        // Fetch product reviews
        const reviewsResponse = await fetch(`http://localhost:3011/reviews/${id}`);
        const reviewsData = await reviewsResponse.json();

        // Fetch usernames for each review
        const reviewsWithUsernames = await Promise.all(reviewsData.map(async (review) => {
          const userResponse = await fetch(`http://localhost:3001/users/${review.user_id}`);
          const userData = await userResponse.json();
          return {
            ...review,
            username: userData.username
          };
        }));
        setReviews(reviewsWithUsernames);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editingReview ? `http://localhost:3011/reviews/${editingReview.id}` : 'http://localhost:3011/reviews';
    const method = editingReview ? 'PUT' : 'POST';

    if (!currentUserId) {
      alert('Please login to review this product');
      window.location.href = '/login';
      setLoading(false);
      return;
    }

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUserId,
          product_id: id,
          rating,
          comment: reviewText
        })
      });

      // Fetch updated reviews
      const updatedReviewsResponse = await fetch(`http://localhost:3011/reviews/${id}`);
      const updatedReviewsData = await updatedReviewsResponse.json();

      // Fetch usernames for updated reviews
      const updatedReviewsWithUsernames = await Promise.all(updatedReviewsData.map(async (review) => {
        const userResponse = await fetch(`http://localhost:3001/users/${review.user_id}`);
        const userData = await userResponse.json();
        return {
          ...review,
          username: userData.username
        };
      }));

      setReviews(updatedReviewsWithUsernames);
      setRating('');
      setReviewText('');
      setEditingReview(null);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (review) => {
    setRating(review.rating);
    setReviewText(review.comment);
    setEditingReview(review);
  };

  const handleDeleteClick = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await fetch(`http://localhost:3011/reviews/${reviewId}`, {
          method: 'DELETE'
        });

        // Fetch updated reviews
        const updatedReviewsResponse = await fetch(`http://localhost:3011/reviews/${id}`);
        const updatedReviewsData = await updatedReviewsResponse.json();

        // Fetch usernames for updated reviews
        const updatedReviewsWithUsernames = await Promise.all(updatedReviewsData.map(async (review) => {
          const userResponse = await fetch(`http://localhost:3001/users/${review.user_id}`);
          const userData = await userResponse.json();
          return {
            ...review,
            username: userData.username
          };
        }));

        setReviews(updatedReviewsWithUsernames);
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  if (!product) {
    return null;
  }

  const recommendedProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="container p-5">
      <div className="row">
        <div className="col-lg-6">
          <div className="card p-5 m-auto">
            <img src={productImage[0]?.image_path} alt="" className="card-img-top img-fluid p-2" />
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card p-3 m-auto">
            <div className="card-body">
              <h5 className="card-title">{category ? category.name : 'Loading category...'}</h5>
              <h6 className="card-title">{subcategory ? subcategory.name : 'Loading subcategory...'}</h6>
              <h3 className="card-text">{product.name}</h3>
              <p className="card-text">
                <span className="text-danger fs-4 me-2">{product.price}$</span>
                <strike>{product.price * 2}$</strike>
              </p>
              <p className="card-text">{product.description}</p>
              <p className="card-text mb-3">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. <br /> 
                Quibusdam tempore unde aperiam, consectetur harum a eum error, <br /> 
                libero nemo quisquam ex assumenda corrupti rerum aut quod et sint facere reprehenderit?
              </p>

              <div className="d-flex align-items-center mb-3 col-6">
                <button className="btn btn-outline-secondary me-2" onClick={() => addToCart(product.id)}>+</button>
                <input className="form-control text-center" type="number" value={cartItems[product.id]} onChange={(e) => updateCartItemCount(Number(e.target.value), product.id)} />
                <button className="btn btn-outline-secondary ms-2" onClick={() => removeToCart(product.id)}>-</button>
              </div>

              <div className="d-flex justify-content-center">
                <button
                  onClick={(event) => {
                    addToCart(product.id); // Pass selectedSize here
                    event.target.classList.toggle("red");
                  }}
                  id='button-link'
                  className="myButton"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="container mt-5">
        <h2 className="text-center">Reviews</h2>
        <form className="mb-5" onSubmit={handleReviewSubmit}>
          <div className="mb-3">
            <label htmlFor="rating" className="form-label">Rating</label>
            <select id="rating" className="form-select " value={rating} onChange={(e) => setRating(e.target.value)} required>
              <option value="">Select rating</option>
              {[1, 2, 3, 4, 5].map(star => (
                <option key={star} value={star}>{star} Star{star > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="review" className="form-label">Review</label>
            <textarea id="review" className="form-control" rows="3" value={reviewText} onChange={(e) => setReviewText(e.target.value)} required></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}
          </button>
        </form>

        <div>
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="review-card mb-4 p-3 border rounded shadow-sm position-relative">
                <div className="position-absolute top-0 end-0 p-2">
                  <StarRating rating={review.rating} />
                </div>
                <div className="review-content">
                  <h5 className="mb-2">{review.username}</h5>
                  <p className="mt-2">{review.comment}</p>
                  <p className="text-muted">
                    {new Date(review.created_at).toLocaleDateString()}
                    {review.created_at !== review.updated_at && ` (Updated: ${new Date(review.updated_at).toLocaleDateString()})`}
                  </p>
                  {currentUserId == review.user_id && (
                    <>
                      <button
                        className="btn btn-warning mt-2 me-2"
                        onClick={() => handleEditClick(review)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger mt-2"
                        onClick={() => handleDeleteClick(review.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </section>

      <h2 className="text-center">Recommended Products</h2>
      <div className="row">
        {recommendedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;
