import React from 'react';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyRupeeIcon,
  BuildingStorefrontIcon 
} from '@heroicons/react/24/outline';

const OrderCard = ({ order, onAccept, onReject, showActions = true }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md transition hover:shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="flex justify-center items-center w-12 h-12 text-white rounded-full bg-primary">
            <BuildingStorefrontIcon className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-bold text-gray-800">{order.restaurantName}</h3>
            <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">₹{order.deliveryFee}</p>
          <p className="text-xs text-gray-600">Delivery Fee</p>
        </div>
      </div>

      {/* Details */}
      <div className="mb-4 space-y-3">
        {/* Pickup Location */}
        <div className="flex items-start">
          <MapPinIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Pickup</p>
            <p className="text-sm text-gray-600">{order.restaurantLocation?.address}</p>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="flex items-start">
          <MapPinIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Delivery</p>
            <p className="text-sm text-gray-600">
              {order.deliveryAddress?.street}, {order.deliveryAddress?.area}
            </p>
          </div>
        </div>

        {/* Distance & Amount */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="mr-1 w-4 h-4" />
            {order.distance ? `${order.distance} km` : 'Calculating...'}
          </div>
          <div className="flex items-center text-sm font-medium text-gray-800">
            <CurrencyRupeeIcon className="w-4 h-4" />
            {order.orderAmount}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-3">
          <button
            onClick={() => onReject(order._id)}
            className="flex-1 px-4 py-2 font-medium text-red-600 rounded-lg border border-red-600 transition hover:bg-red-50"
          >
            Reject
          </button>
          <button
            onClick={() => onAccept(order._id)}
            className="flex-1 px-4 py-2 font-medium text-white bg-green-600 rounded-lg transition hover:bg-green-700"
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
