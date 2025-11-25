import React, { createContext, useContext, useEffect, useState } from 'react';
import { initSocket, connectSocket, disconnectSocket, getSocket } from '../api/socket';
import { useDelivery } from './DeliveryContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { deliveryBoy, isAuthenticated } = useDelivery();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [newOrderNotification, setNewOrderNotification] = useState(null);

  useEffect(() => {
    if (isAuthenticated && deliveryBoy) {
      const socketInstance = initSocket();
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        socketInstance.emit('delivery:join', deliveryBoy.id);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socketInstance.on('new:order', (data) => {
        console.log('New order notification:', data);
        setNewOrderNotification(data);
        
        // Play notification sound
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Order Available!', {
            body: `Order from ${data.restaurantName} - ₹${data.deliveryFee}`,
            icon: '/delivery-boy.svg'
          });
        }
      });

      connectSocket();

      return () => {
        if (deliveryBoy) {
          socketInstance.emit('delivery:leave', deliveryBoy.id);
        }
        disconnectSocket();
      };
    }
  }, [isAuthenticated, deliveryBoy]);

  const clearNotification = () => {
    setNewOrderNotification(null);
  };

  const value = {
    socket,
    connected,
    newOrderNotification,
    clearNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
