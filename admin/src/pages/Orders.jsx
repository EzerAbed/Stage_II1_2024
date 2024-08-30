import React, { useEffect, useState } from 'react';
import OrderCard from '../components/OrderCard';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [searchOrderId, setSearchOrderId] = useState('');
    const [searchUserId, setSearchUserId] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:3009/orders');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleSearchByOrderId = async () => {
        try {
            const response = await fetch(`http://localhost:3009/orders/${searchOrderId}`);
            if (response.ok) {
                const data = await response.json();
                setOrders([data]);
                setError(null);
            } else {
                setOrders([]);
                setError('Order not found');
            }
        } catch (error) {
            console.error('Error searching by order ID:', error);
            setError('Order not found');
        }
    };

    const handleSearchByUserId = async () => {
        try {
            const response = await fetch(`http://localhost:3009/orders/user/${searchUserId}`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
                setError(null);
            } else {
                setOrders([]);
                setError('Order not found');
            }
        } catch (error) {
            console.error('Error searching by user ID:', error);
            setError('Order not found');
        }
    };

    const handleToggleExpand = (orderId) => {
        setExpandedOrderId(orderId === expandedOrderId ? null : orderId);
    };

    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between space-x-4 mb-4">
                <div>
                    <input
                        type="text"
                        value={searchOrderId}
                        onChange={(e) => setSearchOrderId(e.target.value)}
                        placeholder="Search by Order ID"
                        className="p-2 border rounded"
                    />
                    <button onClick={handleSearchByOrderId} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
                        Search
                    </button>
                </div>
                <div>
                    <input
                        type="text"
                        value={searchUserId}
                        onChange={(e) => setSearchUserId(e.target.value)}
                        placeholder="Search by User ID"
                        className="p-2 border rounded"
                    />
                    <button onClick={handleSearchByUserId} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
                        Search
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 text-center font-semibold">{error}</p>}

            {orders.length === 0 && !error ? (
                <p className="text-red-500 text-center font-semibold">No orders made yet</p>
            ) : (
                orders.map(order => (
                    <OrderCard 
                        key={order.id} 
                        order={order} 
                        isExpanded={expandedOrderId === order.id} 
                        onToggleExpand={handleToggleExpand} 
                    />
                ))
            )}
        </div>
    );
};

export default Orders;
