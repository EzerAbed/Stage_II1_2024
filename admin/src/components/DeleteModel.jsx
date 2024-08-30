import React, { useState } from 'react';

const DeleteModal = ({ product, onClose, onDelete }) => {
  const [confirmationText, setConfirmationText] = useState('');

  const handleDelete = async () => {
    if (confirmationText === 'yes i want to delete that product') {
      try {
        const response = await fetch(`http://localhost:3003/products/${product.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onDelete(product.id);  // Optional: Inform the parent component about the deletion
          onClose();
        } else {
          console.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Delete Product</h2>
        <p>To delete the product, please write "yes i want to delete that product"</p>
        <input
          type="text"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded mr-2">Delete</button>
        <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
      </div>
    </div>
  );
};

export default DeleteModal;
