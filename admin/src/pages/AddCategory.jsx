import { useState, useEffect } from "react";

const AddCategory = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newSubcategory, setNewSubcategory] = useState('');
    const [updateCategoryName, setUpdateCategoryName] = useState('');
    const [updateSubcategoryName, setUpdateSubcategoryName] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch categories on component mount
    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:3005/categories')
            .then((res) => res.json())
            .then((data) => {
                setCategories(data);
                console.log(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch categories:', err);
                setLoading(false);
            });
    }, []);

    // Fetch subcategories when selectedCategory changes
    useEffect(() => {
        if (selectedCategory) {
            setLoading(true);
            fetch(`http://localhost:3005/sub_categories/category/${selectedCategory}`)
                .then((res) => res.json())
                .then((data) => {
                    setSubcategories((prev) => ({ ...prev, [selectedCategory]: data }));
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch subcategories:', err);
                    setLoading(false);
                });
        }
    }, [selectedCategory]);

    const addCategory = () => {
        setLoading(true);
        fetch('http://localhost:3005/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newCategory })
        })
            .then((res) => res.json())
            .then((data) => {
                setCategories([...categories, { id: data.id, name: data.name }]);
                setNewCategory('');
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to add category:', err);
                setLoading(false);
            });
    };

    const updateCategory = () => {
        setLoading(true);
        fetch(`http://localhost:3005/categories/${selectedCategory}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: updateCategoryName })
        })
            .then((res) => res.json())
            .then(() => {
                const updatedCategories = categories.map((category) =>
                    category.id === selectedCategory ? { ...category, name: updateCategoryName } : category
                );
                setCategories(updatedCategories);
                setUpdateCategoryName('');
                setSelectedCategory('');
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to update category:', err);
                setLoading(false);
            });
    };

    const deleteCategory = (categoryToDelete) => {
        setLoading(true);
        fetch(`http://localhost:3005/categories/${categoryToDelete}`, { method: 'DELETE' })
            .then((res) => res.json())
            .then(() => {
                setCategories(categories.filter((category) => category.id !== categoryToDelete));
                const updatedSubcategories = { ...subcategories };
                delete updatedSubcategories[categoryToDelete];
                setSubcategories(updatedSubcategories);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to delete category:', err);
                setLoading(false);
            });
    };

    const addSubcategory = () => {
        setLoading(true);
        fetch('http://localhost:3005/sub_category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newSubcategory, category_id: selectedCategory })
        })
            .then((res) => res.json())
            .then((data) => {
                const updatedSubcategories = { ...subcategories };
                updatedSubcategories[selectedCategory].push(data);
                setSubcategories(updatedSubcategories);
                setNewSubcategory('');
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to add subcategory:', err);
                setLoading(false);
            });
    };

    const updateSubcategory = (oldSubcategoryId) => {
        setLoading(true);
        fetch(`http://localhost:3005/sub_categories/${oldSubcategoryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: updateSubcategoryName, parent_id: selectedCategory })
        })
            .then((res) => res.json())
            .then(() => {
                const updatedSubcategories = { ...subcategories };
                const index = updatedSubcategories[selectedCategory].findIndex(
                    (subcategory) => subcategory.id === oldSubcategoryId
                );
                if (index !== -1) {
                    updatedSubcategories[selectedCategory][index].name = updateSubcategoryName;
                    setSubcategories(updatedSubcategories);
                    setUpdateSubcategoryName('');
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to update subcategory:', err);
                setLoading(false);
            });
    };

    const deleteSubcategory = (subcategoryIdToDelete) => {
        setLoading(true);
        fetch(`http://localhost:3005/sub_categories/${subcategoryIdToDelete}`, { method: 'DELETE' })
            .then((res) => res.json())
            .then(() => {
                const updatedSubcategories = { ...subcategories };
                updatedSubcategories[selectedCategory] = updatedSubcategories[selectedCategory].filter(
                    (subcategory) => subcategory.id !== subcategoryIdToDelete
                );
                setSubcategories(updatedSubcategories);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to delete subcategory:', err);
                setLoading(false);
            });
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-3xl mx-auto shadow-md rounded-lg">
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
                    <div className="loader"></div>
                </div>
            )}
            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Add New Category</h3>
                <div className="flex space-x-2 mt-2">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New Category"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                        onClick={addCategory}
                        className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Add
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Update Category</h3>
                <div className="flex space-x-2 mt-2">
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setUpdateCategoryName(
                                categories.find((category) => category.id === e.target.value)?.name || ''
                            );
                            setSelectedSubcategory(''); // Reset subcategory selection when category changes
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={updateCategoryName}
                        onChange={(e) => setUpdateCategoryName(e.target.value)}
                        placeholder="Update Category"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                        onClick={updateCategory}
                        className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Update
                    </button>
                    <button
                        onClick={() => deleteCategory(selectedCategory)}
                        className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {selectedCategory && (
                <>
                    <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Add New Subcategory</h3>
                        <div className="flex space-x-2 mt-2">
                            <input
                                type="text"
                                value={newSubcategory}
                                onChange={(e) => setNewSubcategory(e.target.value)}
                                placeholder="New Subcategory"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <button
                                onClick={addSubcategory}
                                className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Update Subcategory</h3>
                        <div className="flex space-x-2 mt-2">
                            <select
                                value={selectedSubcategory}
                                onChange={(e) => {
                                    setSelectedSubcategory(e.target.value);
                                    setUpdateSubcategoryName(
                                        subcategories[selectedCategory].find((subcategory) => subcategory.id === e.target.value)?.name || ''
                                    );
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Select Subcategory</option>
                                {subcategories[selectedCategory]?.map((subcategory) => (
                                    <option key={subcategory.id} value={subcategory.id}>
                                        {subcategory.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={updateSubcategoryName}
                                onChange={(e) => setUpdateSubcategoryName(e.target.value)}
                                placeholder="Update Subcategory"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <button
                                onClick={() => updateSubcategory(selectedSubcategory)}
                                className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => deleteSubcategory(selectedSubcategory)}
                                className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AddCategory;

