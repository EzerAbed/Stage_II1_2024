import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderCard = ({ order, isExpanded, onToggleExpand }) => {
    const [orderItems, setOrderItems] = useState([]);
    const [username, setUsername] = useState('');
    const [shipmentDetails, setShipmentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsername();
        if (isExpanded) {
            fetchOrderItems();
            fetchShipmentDetails();
        }
    }, [isExpanded, order.id]);

    const fetchUsername = async () => {
        try {
            const response = await fetch(`http://localhost:3001/users/${order.user_id}`);
            const userData = await response.json();
            setUsername(userData.username);
        } catch (error) {
            console.error('Error fetching username:', error);
        }
    };

    const fetchOrderItems = async () => {
        try {
            const response = await fetch(`http://localhost:3009/orders/${order.id}/items`);
            const items = await response.json();

            const itemsWithProductNames = await Promise.all(
                items.map(async item => {
                    const productResponse = await fetch(`http://localhost:3003/products/${item.product_id}`);
                    const productData = await productResponse.json();
                    return { ...item, product_name: productData.name };
                })
            );

            setOrderItems(itemsWithProductNames);
        } catch (error) {
            console.error('Error fetching order items:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchShipmentDetails = async () => {
        try {
            const response = await fetch(`http://localhost:3015/shipments/order/${order.id}`);
            if (response.ok) {
                const data = await response.json();
                setShipmentDetails(data[0]);
            } else {
                setShipmentDetails(null);
            }
        } catch (error) {
            console.error('Error fetching shipment details:', error);
        }
    };

    const handleShipmentClick = () => {
        if (shipmentDetails) {
            navigate(`/updateshipment/${order.id}`);
        } else {
            navigate(`/shipment/${order.id}`);
        }
    };

    return (
        <div 
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg transition-all duration-300 cursor-pointer ${isExpanded ? 'shadow-lg' : 'shadow'}`} 
            onClick={() => onToggleExpand(order.id)}
        >
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{`Order #${order.id}`}</h3>
                <span className="text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <p className="mt-2">{`Total Amount: ${order.total_amount} DT`}</p>
            <p>{`Order Status: ${order.order_status}`}</p>
            <p>{`Payment Status: ${order.payment_status}`}</p>
            <p>{`User ID: ${order.user_id}`}</p>
            <p>{`Username: ${username}`}</p>

            {isExpanded && (
                <div className="mt-4">
                    {loading ? (
                        <p className="text-gray-400">Loading items...</p>
                    ) : orderItems.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2">
                            {orderItems.map(item => (
                                <li key={item.id} className="border-t border-gray-600 pt-2">
                                    {`${item.product_name} - Quantity: ${item.quantity}, Unit Price: ${item.unit_price} DT, Total: ${item.total_price} DT`}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No items found for this order.</p>
                    )}

                    {shipmentDetails ? (
                        <div className="mt-4">
                            <p>{`Transporter: ${shipmentDetails.transporter_id}`}</p>
                            <p>{`Address: ${shipmentDetails.address_id}`}</p>
                            <p>{`Shipment Date: ${shipmentDetails.shipment_date}`}</p>
                            <p>{`Estimated Delivery Date: ${shipmentDetails.estimated_delivery_date}`}</p>
                            <p>{`Status: ${shipmentDetails.status}`}</p>
                        </div>
                    ) : (
                        <p className="text-red-500 mt-4">Shipment details not provided yet</p>
                    )}

                    <button
                        onClick={handleShipmentClick}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        {shipmentDetails ? 'Update Shipment Details' : 'Create Shipment Details'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderCard;
