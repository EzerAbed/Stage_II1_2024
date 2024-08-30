import React, { useState, useEffect } from 'react';

const ManagePromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [newPromotion, setNewPromotion] = useState({
        code: '',
        description: '',
        type: 'percent',
        valeur: '',
        date_debut: '',
        date_fin: ''
    });
    const [editingPromotion, setEditingPromotion] = useState(null);

    useEffect(() => {
        // Fetch existing promotions when the component mounts
        fetch('http://localhost:3003/promotions')
            .then((response) => response.json())
            .then((data) => setPromotions(data))
            .catch((error) => console.error('Error fetching promotions:', error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPromotion({ ...newPromotion, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = editingPromotion ? `http://localhost:3003/promotions/${editingPromotion.id}` : 'http://localhost:3003/promotions';
        const method = editingPromotion ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPromotion),
        })
            .then((response) => response.json())
            .then((data) => {
                if (editingPromotion) {
                    setPromotions((prev) =>
                        prev.map((promotion) => (promotion.id === data.id ? data : promotion))
                    );
                } else {
                    setPromotions((prev) => [...prev, data]);
                }
                setNewPromotion({
                    code: '',
                    description: '',
                    type: 'percent',
                    valeur: '',
                    date_debut: '',
                    date_fin: ''
                });
                setEditingPromotion(null);
            })
            .catch((error) => console.error('Error saving promotion:', error));
    };

    const handleEdit = (promotion) => {
        setNewPromotion(promotion);
        setEditingPromotion(promotion);
    };

    const handleDelete = (id) => {
        fetch(`http://localhost:3003/promotions/${id}`, {
            method: 'DELETE',
        })
            .then(() => {
                setPromotions((prev) => prev.filter((promotion) => promotion.id !== id));
            })
            .catch((error) => console.error('Error deleting promotion:', error));
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-3xl mx-auto shadow-md rounded-lg">
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="code">
                        Promotion Code
                    </label>
                    <input
                        id="code"
                        name="code"
                        type="text"
                        placeholder="Promotion Code"
                        value={newPromotion.code}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows="3"
                        placeholder="Description"
                        value={newPromotion.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="type">
                        Promotion Type
                    </label>
                    <select
                        id="type"
                        name="type"
                        value={newPromotion.type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="percent">Percent</option>
                        <option value="fixed amount">Fixed Amount</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="valeur">
                        Value
                    </label>
                    <input
                        id="valeur"
                        name="valeur"
                        type="number"
                        placeholder="Promotion Value"
                        value={newPromotion.valeur}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="date_debut">
                        Start Date
                    </label>
                    <input
                        id="date_debut"
                        name="date_debut"
                        type="date"
                        value={newPromotion.date_debut}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="date_fin">
                        End Date
                    </label>
                    <input
                        id="date_fin"
                        name="date_fin"
                        type="date"
                        value={newPromotion.date_fin}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {editingPromotion ? 'Update Promotion' : 'Add Promotion'}
                    </button>
                </div>
            </form>

            <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">Existing Promotions</h2>
                <ul className="mt-4 space-y-4">
                    {promotions.map((promotion) => (
                        <li key={promotion.id} className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
                            <h3 className="text-md font-semibold text-gray-900 dark:text-white">{promotion.code}</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{promotion.description}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Type: {promotion.type} | Value: {promotion.valeur}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Duration: {promotion.date_debut} to {promotion.date_fin}
                            </p>
                            <div className="mt-4 flex space-x-4">
                                <button
                                    onClick={() => handleEdit(promotion)}
                                    className="text-blue-500 hover:underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(promotion.id)}
                                    className="text-red-500 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ManagePromotions;
