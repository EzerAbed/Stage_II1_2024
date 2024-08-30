import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Shipment = () => {
    const { order_id } = useParams();  // Extract order_id from the URL
    const navigate = useNavigate();  // Initialize the navigate function
    const [order, setOrder] = useState(null);
    const [username, setUsername] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [transporters, setTransporters] = useState([]);
    const [formData, setFormData] = useState({
        user_id: '',
        transporter_id: '',
        address_id: '',
        shipment_date: '',
        estimated_delivery_date: '',
        status: 'pending'
    });

    useEffect(() => {
        fetchOrderDetails();
        fetchTransporters();
    }, [order_id]);

    const fetchOrderDetails = async () => {
        try {
            const orderResponse = await fetch(`http://localhost:3009/orders/${order_id}`);
            const orderData = await orderResponse.json();
            setOrder(orderData);
            setFormData({ ...formData, user_id: orderData.user_id, address_id: orderData.address_id });

            const userResponse = await fetch(`http://localhost:3001/users/${orderData.user_id}`);
            const userData = await userResponse.json();
            setUsername(userData.username);

            const addressResponse = await fetch(`http://localhost:3001/user/${orderData.user_id}/addresses`);
            const addressData = await addressResponse.json();
            setAddresses(addressData);
        } catch (error) {
            console.error('Error fetching order details, user information, or addresses:', error);
        }
    };

    const fetchTransporters = async () => {
        try {
            const response = await fetch('http://localhost:3015/shipment/transporters');
            const data = await response.json();
            setTransporters(data);
        } catch (error) {
            console.error('Error fetching transporters:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3015/shipment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: formData.user_id,
                    transporter_id: formData.transporter_id,
                    order_id: order_id,
                    address_id: formData.address_id,
                    shipment_date: formData.shipment_date,
                    estimated_delivery_date: formData.estimated_delivery_date,
                    status: formData.status,
                }),
            });

            if (response.ok) {
                const data = await response.text();
                console.log(data);  // "New shipment added with id: <id>"
                navigate('/orders');  // Navigate back to the orders page
            } else {
                console.error('Failed to save shipment details');
            }
        } catch (error) {
            console.error('Error saving shipment details:', error);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Shipment Details for Order ID: {order_id}</h2>
            <p className="mb-2">{`User ID: ${formData.user_id}, Username: ${username}`}</p>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Transporter</label>
                    <select
                        name="transporter_id"
                        value={formData.transporter_id}
                        onChange={handleChange}
                        className="w-full p-2 border rounded">
                        <option value="">Select Transporter</option>
                        {transporters.map(transporter => (
                            <option key={transporter.id} value={transporter.id}>
                                {transporter.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Address</label>
                    <select
                        name="address_id"
                        value={formData.address_id}
                        onChange={handleChange}
                        className="w-full p-2 border rounded">
                        <option value="">Select Address</option>
                        {addresses.map(address => (
                            <option key={address.id} value={address.id}>
                                {address.street}, {address.city}, {address.zip_code}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Shipment Date</label>
                    <input
                        type="date"
                        name="shipment_date"
                        value={formData.shipment_date}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div class="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Estimated Delivery Date</label>
                    <input
                        type="date"
                        name="estimated_delivery_date"
                        value={formData.estimated_delivery_date}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-2 border rounded">
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="canceled">Canceled</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Save Shipment Details
                </button>
            </form>
        </div>
    );
};

export default Shipment;
