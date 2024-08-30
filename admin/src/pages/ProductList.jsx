import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UpdateModal from '../components/UpdateModel';
import DeleteModal from '../components/DeleteModel';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchPromotions();
  }, []);

  const fetchProducts = async () => {
    try {
      const productResponse = await fetch('http://localhost:3003/products');
      const products = await productResponse.json();

      const productsWithDetails = await Promise.all(
        products.map(async (product) => {
          const imagesResponse = await fetch(`http://localhost:3003/products/${product.id}/images`);
          const images = await imagesResponse.json();
          const primaryImage = images.find(image => image.isprimary) || images[0];

          const promotionResponse = await fetch('http://localhost:3003/products-with-promotion');
          const promotions = await promotionResponse.json();

          const productPromotion = promotions.find(promotion => promotion.product_id === product.id);
          let promotionCode = '-';
          if (productPromotion) {
            const promoResponse = await fetch(`http://localhost:3003/promotions/${productPromotion.promotion_id}`);
            const promo = await promoResponse.json();
            promotionCode = promo.code;
          }

          return {
            ...product,
            image: primaryImage ? primaryImage.image_path : '',
            promotion_code: promotionCode,
          };
        })
      );

      setProducts(productsWithDetails);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await fetch('http://localhost:3003/promotions');
      const promotionsData = await response.json();
      setPromotions(promotionsData);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleUpdate = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };

  const handlePromotionDoubleClick = (product) => {
    setEditingPromotion(product.id);
  };

  const handlePromotionChange = (e) => {
    setSelectedPromotion(e.target.value);
  };

  const handleAssignPromotion = async (product) => {
    try {
      const response = await fetch('http://localhost:3003/product_promotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          promotion_id: selectedPromotion,
        }),
      });

      if (response.ok) {
        fetchProducts(); // Refresh product list to reflect changes
        setEditingPromotion(null);
      } else {
        console.error('Failed to assign promotion');
      }
    } catch (error) {
      console.error('Error assigning promotion:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Product List</h1>
        <div>
          <Link to="/add-product" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Add Product</Link>
          <Link to="/create-promotion" className="bg-green-500 text-white px-4 py-2 rounded">Create Promotion</Link>
        </div>
      </div>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Subcategory</th>
            <th className="px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Promotion</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td className="border px-4 py-2">
                {product.image && <img src={product.image} alt={product.name} className="w-16 h-16" />}
              </td>
              <td className="border px-4 py-2">{product.name}</td>
              <td className="border px-4 py-2">{product.price}</td>
              <td className="border px-4 py-2">{product.description}</td>
              <td className="border px-4 py-2">{product.category}</td>
              <td className="border px-4 py-2">{product.subcategory}</td>
              <td className="border px-4 py-2">{product.quantity}</td>
              <td className="border px-4 py-2" onDoubleClick={() => handlePromotionDoubleClick(product)}>
                {editingPromotion === product.id ? (
                  <>
                    <select value={selectedPromotion} onChange={handlePromotionChange} className="border p-2">
                      <option value="">Select Promotion</option>
                      {promotions.map(promo => (
                        <option key={promo.id} value={promo.id}>{promo.code}</option>
                      ))}
                    </select>
                    <button onClick={() => handleAssignPromotion(product)} className="bg-green-500 text-white px-4 py-2 rounded ml-2">Save</button>
                  </>
                ) : (
                  product.promotion_code
                )}
              </td>
              <td className="border px-4 py-2">
                <button onClick={() => handleUpdate(product)} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">Update</button>
                <button onClick={() => handleDelete(product)} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showUpdateModal && (
        <UpdateModal
          product={selectedProduct}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={fetchProducts}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          product={selectedProduct}
          onClose={() => setShowDeleteModal(false)}
          onDelete={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductList;
