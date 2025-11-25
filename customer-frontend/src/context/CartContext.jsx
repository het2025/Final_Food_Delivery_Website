import { createContext, useState, useContext, useEffect } from 'react'
import { orderService } from '../services/api' // Import the new orderService
import { useUser } from './UserContext'; // Import useUser

const CART_STORAGE_KEY = 'quickbite_cart'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const { refreshUser } = useUser(); // Get refreshUser from UserContext
  // Load initial items from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })

  // Keep cart synced to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const [appliedOffer, setAppliedOffer] = useState(null)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [deliveryAddress, setDeliveryAddress] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [transactionId, setTransactionId] = useState(null)
  const [estimatedDelivery, setEstimatedDelivery] = useState(null)
  const [loyaltyPointsEarned, setLoyaltyPointsEarned] = useState(0)
  const [cashbackEarned, setCashbackEarned] = useState(0)
  const [lastOrder, setLastOrder] = useState(null)

  // Add item (correct: different food with different _id will be added as new item)
  const addToCart = (item) => {
    setCartItems(prev => {
      if (!item._id) { 
        alert('No item ID provided!') 
        return prev 
      }
      const existing = prev.find(i => i._id === item._id)
      if (existing) {
        return prev.map(i =>
          i._id === item._id ? { ...i, qty: i.qty + (item.qty || 1) } : i
        )
      } else {
        return [...prev, { ...item, qty: item.qty || 1 }]
      }
    })
  }

  // Set cart items directly, useful for bulk/restore
  const setCartItemsDirectly = (items) => setCartItems(items)

  // Remove item by ID
  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i._id !== itemId))
  }

  // Update item quantity
  const updateQty = (itemId, qty) => {
    if (qty < 1) return
    setCartItems(prev =>
      prev.map(i =>
        i._id === itemId ? { ...i, qty } : i
      )
    )
  }

  // Clear entire cart - MOVED INSIDE COMPONENT
  const clearCart = () => {
    console.log('🧹 Clearing cart...')
    setCartItems([])
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setAppliedOffer(null)
    localStorage.removeItem(CART_STORAGE_KEY)
    localStorage.removeItem('cartItems') // Also remove old key
    console.log('✅ Cart cleared successfully')
  }

  // Apply coupon logic (now using backend API)
  const applyCoupon = async (couponCode) => {
    const code = couponCode.trim().toUpperCase();
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    try {
      const response = await orderService.validateCoupon(code, subtotal);

      if (response.success) {
        setAppliedCoupon(response.data.code);
        const calculatedDiscount = Math.min(response.data.discountAmount, subtotal);
        setDiscountAmount(calculatedDiscount);
        setAppliedOffer(response.data); // Store full coupon data
        return { success: true, message: response.message };
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setAppliedOffer(null);
        return { success: false, message: response.message || 'Failed to apply coupon' };
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setAppliedOffer(null);
      return { success: false, message: error.message || 'An error occurred while applying coupon.' };
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setAppliedOffer(null);
  };

  // Remove all items (clears cart) - alias for clearCart
  const removeAllItems = () => {
    clearCart();
  };

  // Calculate total with discount
  const getTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    return Math.max(subtotal - discountAmount, 0)
  }

  // Place order
  const placeOrder = async (method) => {
    const newOrderId = 'ORD' + Date.now()
    setOrderId(newOrderId)
    setPaymentMethod(method)
    
    const now = new Date()
    const deliveryTime = new Date(now.getTime() + (35 * 60 * 1000))
    setEstimatedDelivery(deliveryTime.toLocaleTimeString())
    
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    const taxes = subtotal * 0.05
    const deliveryFee = 40
    const total = getTotal() + taxes + deliveryFee
    
    const points = Math.floor(total / 10)
    setLoyaltyPointsEarned(points)
    setCashbackEarned(total * 0.02)
    
    if (method === 'COD') {
      setPaymentStatus('Unpaid')
      setTransactionId(null)
    } else {
      setPaymentStatus('Paid')
      setTransactionId('TXN' + Date.now())
    }
    
    const orderData = {
      orderId: newOrderId,
      paymentMethod: method,
      paymentStatus: method === 'COD' ? 'Unpaid' : 'Paid',
      transactionId: method === 'COD' ? null : 'TXN' + Date.now(),
      estimatedDelivery: deliveryTime.toLocaleTimeString(),
      loyaltyPointsEarned: points,
      cashbackEarned: total * 0.02,
      deliveryAddress,
      cartItems,
      subtotal,
      taxes,
      deliveryFee,
      total
    }
    
    setLastOrder(orderData)
    localStorage.setItem('lastOrder', JSON.stringify(orderData))
    
    // Clear cart after placing order
    removeAllItems();
    
    // Refresh user data to update completedOrdersCount for rewards
    if (refreshUser) {
      await refreshUser(); // Call refreshUser to update user context
    }
  }

  const value = {
    cartItems,
    addToCart,
    setCartItemsDirectly,
    removeFromCart,
    updateQty,
    clearCart, // Now properly defined inside component
    appliedOffer,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    removeAllItems,
    getTotal,
    deliveryAddress,
    setDeliveryAddress,
    orderId,
    paymentMethod,
    paymentStatus,
    transactionId,
    estimatedDelivery,
    loyaltyPointsEarned,
    cashbackEarned,
    lastOrder,
    setLastOrder,
    placeOrder
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContext
