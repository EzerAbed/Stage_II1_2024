import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [primaryImage, setPrimaryImage] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3005/categories')
            .then((response) => response.json())
            .then((data) => {
                setCategories(data);
            })
            .catch((error) => console.error('Error fetching categories:', error));
    }, []);

    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
        };
    }, [imagePreviews]);

    const handleCategorySelection = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);

        if (category) {
            fetch(`http://localhost:3005/sub_categories/category/${category}`)
                .then((response) => response.json())
                .then((data) => {
                    setSubcategories((prevSubcategories) => ({
                        ...prevSubcategories,
                        [category]: data, // store full subcategory objects
                    }));
                })
                .catch((error) => console.error('Error fetching subcategories:', error));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imagePreviews = files.map((file) => URL.createObjectURL(file));
        setImages((prevImages) => [...prevImages, ...files]);
        setImagePreviews((prevPreviews) => [...prevPreviews, ...imagePreviews]);
    };

    const handlePrimaryImageSelection = (index) => {
        setPrimaryImage(index);
    };

    const handleImageRemoval = (index) => {
        const updatedImages = images.filter((_, i) => i !== index);
        const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(updatedImages);
        setImagePreviews(updatedPreviews);
        if (primaryImage === index) {
            setPrimaryImage(null);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (primaryImage === null) {
            alert("Please select a primary image.");
            return;
        }

        const formData = new FormData();
        formData.append('name', e.target['product-name'].value);
        formData.append('price', e.target['product-price'].value);
        formData.append('description', e.target['product-description'].value);
        formData.append('stock', e.target['product-stock'].value);
        formData.append('category_id', selectedCategory);
        formData.append('subcategory_id', selectedSubcategory); // use subcategory id

        images.forEach((file, index) => {
            formData.append('photos', file);
            if (index === primaryImage) {
                formData.append('primaryImage', true);
            } else {
                formData.append('primaryImage', false);
            }
        });

        fetch('http://localhost:3003/products', {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to create product');
                }
                return response.json();
            })
            .then(() => {
                alert('Product added successfully!');
                navigate('/products');
            })
            .catch((error) => {
                console.error('Error creating product:', error);
            });
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-3xl mx-auto shadow-md rounded-lg">
            <form className="space-y-6" onSubmit={handleFormSubmit}>
                {/* Input fields for product name, price, and description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="product-name">
                        Product Name
                    </label>
                    <input
                        id="product-name"
                        type="text"
                        placeholder="Product Name"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="product-price">
                        Price
                    </label>
                    <input
                        type="number"
                        id="product-price"
                        placeholder="Product Price"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="product-description">
                        Description
                    </label>
                    <textarea
                        id="product-description"
                        rows="3"
                        placeholder="Product Description"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="product-category">
                        Category
                    </label>
                    <div className="flex items-center space-x-2">
                        <select
                            id="product-category"
                            value={selectedCategory}
                            onChange={handleCategorySelection}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">Select Category</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <Link to="/category" className="text-sm text-blue-500 hover:underline">
                            Manage Categories
                        </Link>
                    </div>
                </div>
                {selectedCategory && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="product-subcategory">
                            Subcategory
                        </label>
                        <select
                            id="product-subcategory"
                            value={selectedSubcategory}
                            onChange={(e) => setSelectedSubcategory(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">Select Subcategory</option>
                            {subcategories[selectedCategory]?.map((subcategory, index) => (
                                <option key={index} value={subcategory.id}>
                                    {subcategory.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="product-stock">
                        Stock Quantity
                    </label>
                    <input
                        type="number"
                        id="product-stock"
                        placeholder="Stock Quantity"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="product-image">
                        Product Images
                    </label>
                    <input
                        type="file"
                        id="product-image"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        onChange={handleImageUpload}
                        multiple
                        required
                    />
                </div>

                {/* Image Preview and Primary Image Selection */}
                <div className="flex flex-wrap gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                            <img
                                src={preview}
                                alt={`Preview ${index}`}
                                className={`w-24 h-24 object-cover rounded ${primaryImage === index ? 'ring-4 ring-blue-500' : ''}`}
                                onClick={() => handlePrimaryImageSelection(index)}
                            />
                            <button
                                type="button"
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                onClick={() => handleImageRemoval(index)}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
