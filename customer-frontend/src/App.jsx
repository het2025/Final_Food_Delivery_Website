import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';
import AIChatBot from './components/AIChatBot';

// Context Providers
import { CartProvider } from './context/CartContext';
import { useUser, UserProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';

// Main Public Home/Landing Page
import MainHomePage from './pages/MainHomePage';

// Unified Login/Signup Page
import LoginSignup from './pages/auth/LoginSignup';

// Customer Pages
import Home from './pages/customer/Home';
import Cart from './pages/customer/Cart';
import Menu from './pages/customer/Menu';
import Payment from './pages/customer/Payment';
import OrderSuccess from './pages/customer/OrderSuccess';
import Restaurants from './pages/customer/Restaurants';
import CustomerProfilePage from './pages/customer/ProfilePage';
import CustomerSettings from './pages/customer/Settings';
import Rewards from './pages/customer/Rewards';
import CustomerOrders from './pages/customer/Orders';
import OrderDetails from './pages/customer/OrderDetails';
import CustomerAddresses from './pages/customer/Addresses';
import CustomerHelp from './pages/customer/Help';
import CustomerRefundPolicy from './pages/customer/RefundPolicy';
import CustomerTerms from './pages/customer/Terms';
import CustomerPrivacy from './pages/customer/Privacy';
import SearchPage from './pages/customer/SearchPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import NewlyRegistered from './pages/customer/NewlyRegistered';


// Error Pages
import Error404 from './pages/Error404';
import Error500 from './pages/Error500';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <Loading />;

  return (
    <UserProvider>
      <CartProvider>
        <SocketProvider>
          <Router>
            <AppContent />
          </Router>
        </SocketProvider>
      </CartProvider>
    </UserProvider>
  );
};

const AppContent = () => {
  const { user, loading: userLoading } = useUser();

  useEffect(() => {

  }, [user]);

  if (userLoading) return <Loading />;

  return (

    <>
      <Routes>
        {/* Public Main Landing Page */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/home" replace />
              : <MainHomePage />
          }
        />

        {/* Unified Login/Signup Page */}
        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/home" replace />
              : <LoginSignup />
          }
        />
        <Route
          path="/signup"
          element={
            user
              ? <Navigate to="/home" replace />
              : <LoginSignup />
          }
        />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurants"
          element={
            <ProtectedRoute>
              <Restaurants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newly-registered"
          element={
            <ProtectedRoute>
              <NewlyRegistered />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu/:vendorId"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <CustomerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <CustomerAddresses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <CustomerSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-order/:orderId"
          element={
            <ProtectedRoute>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />



        {/* Public Info Pages */}
        <Route path="/help" element={<CustomerHelp />} />
        <Route path="/refund-policy" element={<CustomerRefundPolicy />} />
        <Route path="/terms" element={<CustomerTerms />} />
        <Route path="/privacy" element={<CustomerPrivacy />} />

        {/* Error Pages */}
        <Route path="/404" element={<Error404 />} />
        <Route path="/500" element={<Error500 />} />

        {/* Catch All */}
        <Route path="*" element={<Error404 />} />
      </Routes>

      {/* AI Chatbot Widget - Available on all pages */}
      <AIChatBot />
    </>
  );

};

export default App;
