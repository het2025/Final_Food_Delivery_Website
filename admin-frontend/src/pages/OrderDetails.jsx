import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../api/adminApi';
import { ArrowLeftIcon, XCircleIcon } from '@heroicons/react/24/outline';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await ordersAPI.getById(id);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    const notes = prompt(`Change order status to "${newStatus}"?\n\nAdd notes (optional):`);
    
    if (notes === null) return;

    try {
      setUpdating(true);
      const response = await ordersAPI.updateStatus(id, newStatus, notes);
      
      if (response.data.success) {
        alert('Order status updated successfully');
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt('Cancel this order?\n\nPlease provide a reason:');
    
    if (!reason) return;

    try {
      setUpdating(true);
      const response = await ordersAPI.cancel(id, reason);
      
      if (response.data.success) {
        alert('Order cancelled successfully');
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const { order, customer } = data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to Orders
      </button>

      {/* Order Header */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order #{order.orderNumber || order._id.slice(-8)}</h2>
            <p className="mt-1 text-gray-600">
              Placed on {new Date(order.createdAt || order.orderTime).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {order.status}
            </span>
            <p className="mt-2 text-2xl font-bold text-gray-800">₹{order.total || order.totalAmount}</p>
          </div>
        </div>
      </div>

      {/* Customer & Restaurant Info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Customer */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Customer Details</h3>
          {customer ? (
            <div className="space-y-2">
              <p className="text-gray-600"><span className="font-medium">Name:</span> {customer.name}</p>
              <p className="text-gray-600"><span className="font-medium">Email:</span> {customer.email}</p>
              <p className="text-gray-600"><span className="font-medium">Phone:</span> {customer.phone || 'N/A'}</p>
            </div>
          ) : (
            <p className="text-gray-500">Customer information not available</p>
          )}
        </div>

        {/* Restaurant */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Restaurant Details</h3>
          <div className="space-y-2">
            <p className="text-gray-600"><span className="font-medium">Name:</span> {order.restaurantName || 'N/A'}</p>
            <p className="text-gray-600"><span className="font-medium">Payment:</span> {order.paymentMethod || 'N/A'}</p>
            <p className="text-gray-600"><span className="font-medium">Payment Status:</span> {order.paymentStatus || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Delivery Address</h3>
          <p className="text-gray-600">
            {order.deliveryAddress.street}, {order.deliveryAddress.city}, 
            {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
          </p>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  {item.extras && item.extras.length > 0 && (
                    <p className="text-sm text-gray-500">Extras: {item.extras.join(', ')}</p>
                  )}
                </div>
                <p className="font-semibold text-gray-800">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="pt-6 mt-6 space-y-2 border-t">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal || (order.total - (order.deliveryFee || 0))}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₹{order.deliveryFee}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-lg font-bold text-gray-800 border-t">
              <span>Total</span>
              <span>₹{order.total || order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Admin Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusUpdate('Confirmed')}
              disabled={updating}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Mark as Confirmed
            </button>
            <button
              onClick={() => handleStatusUpdate('Preparing')}
              disabled={updating}
              className="px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              Mark as Preparing
            </button>
            <button
              onClick={() => handleStatusUpdate('Out for Delivery')}
              disabled={updating}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Out for Delivery
            </button>
            <button
              onClick={() => handleStatusUpdate('Delivered')}
              disabled={updating}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Mark as Delivered
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={updating}
              className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <XCircleIcon className="w-5 h-5 mr-2" />
              Cancel Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
