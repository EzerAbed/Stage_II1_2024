import React, { useState, useEffect } from 'react';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all reviews
        const reviewsResponse = await fetch('http://localhost:3011/reviews');
        const reviewsData = await reviewsResponse.json();

        // Fetch all users
        const usersResponse = await fetch('http://localhost:3001/users');
        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Fetch all products
        const productsResponse = await fetch('http://localhost:3003/products');
        const productsData = await productsResponse.json();
        setProducts(productsData);

        // Set reviews
        setReviews(reviewsData);
        setFilteredReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchReviewsByUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3011/reviews/user/${userId}`);
      const data = await response.json();
      setFilteredReviews(data);
    } catch (error) {
      console.error('Error fetching reviews by user:', error);
    }
  };

  const fetchReviewsByProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3011/reviews/${productId}`);
      const data = await response.json();
      setFilteredReviews(data);
    } catch (error) {
      console.error('Error fetching reviews by product:', error);
    }
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    if (userId) {
      fetchReviewsByUser(userId);
    } else {
      setFilteredReviews(reviews);
    }
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProductId(productId);
    if (productId) {
      fetchReviewsByProduct(productId);
    } else {
      setFilteredReviews(reviews);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await fetch(`http://localhost:3011/reviews/${reviewId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setFilteredReviews(filteredReviews.filter(review => review.id !== reviewId));
          setReviews(reviews.filter(review => review.id !== reviewId));
        } else {
          console.error('Failed to delete the review');
        }
      } catch (error) {
        console.error('Error deleting the review:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-3xl font-bold mb-6">Reviews Page</h1>

      <div className="flex justify-between mb-6">
        <div className="w-1/2 mr-2">
          <label htmlFor="userSelect" className="block text-lg font-medium mb-2">Filter by User</label>
          <select
            id="userSelect"
            className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800"
            value={selectedUserId}
            onChange={handleUserChange}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
        </div>

        <div className="w-1/2 ml-2">
          <label htmlFor="productSelect" className="block text-lg font-medium mb-2">Filter by Product</label>
          <select
            id="productSelect"
            className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800"
            value={selectedProductId}
            onChange={handleProductChange}
          >
            <option value="">All Products</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredReviews.length > 0 ? (
        filteredReviews.map(review => (
          <div key={review.id} className="bg-white dark:bg-gray-800 shadow-md rounded-md p-4 mb-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-xl font-semibold">
                {users.find(user => user.id === review.user_id)?.username || 'Unknown User'}
              </h5>
              <div className="text-yellow-500 text-xl">
                {Array(review.rating).fill('★').join('')}
                {Array(5 - review.rating).fill('☆').join('')}
              </div>
            </div>
            <p className="text-gray-700 mb-2">
              Product: {products.find(product => product.id === review.product_id)?.name || 'Unknown Product'}
            </p>
            <p className="text-gray-600 mb-2">{review.comment}</p>
            <p className="text-gray-500 text-sm mb-3">
              {new Date(review.created_at).toLocaleDateString()}
              {review.created_at !== review.updated_at && ` (Updated: ${new Date(review.updated_at).toLocaleDateString()})`}
            </p>
            <button
              onClick={() => handleDeleteReview(review.id)}
              className="bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 text-lg">No reviews yet.</p>
      )}
    </div>
  );
};

export default Reviews;
