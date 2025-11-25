export const setupOrderSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Delivery boy connected:', socket.id);

    // Join delivery boy room
    socket.on('delivery:join', (deliveryBoyId) => {
      socket.join(`delivery:${deliveryBoyId}`);
      console.log(`Delivery boy ${deliveryBoyId} joined`);
    });

    // Leave room
    socket.on('delivery:leave', (deliveryBoyId) => {
      socket.leave(`delivery:${deliveryBoyId}`);
      console.log(`Delivery boy ${deliveryBoyId} left`);
    });

    socket.on('disconnect', () => {
      console.log('Delivery boy disconnected:', socket.id);
    });
  });

  return io;
};

// Helper function to notify delivery boys about new orders
export const notifyAvailableDeliveryBoys = (io, order) => {
  io.emit('new:order', {
    orderId: order._id,
    restaurantName: order.restaurantName,
    deliveryAddress: order.deliveryAddress,
    orderAmount: order.orderAmount,
    deliveryFee: order.deliveryFee,
    distance: order.distance
  });
};

// Notify specific delivery boy
export const notifyDeliveryBoy = (io, deliveryBoyId, event, data) => {
  io.to(`delivery:${deliveryBoyId}`).emit(event, data);
};
