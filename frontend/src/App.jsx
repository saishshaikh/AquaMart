import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";

// Shop & Items
import CreateShop from "./pages/CreateShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";

// Cart & Checkout
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage"; 
import ProductDetails from "./pages/ProductDetails"; 

// Order Pages
import OrderPlaced from "./pages/OrderPlaced";
import MyOrders from "./pages/MyOrders";
import OwnerOrders from "./pages/OwnerOrders"; // ✅ CORRECT IMPORT

// Hooks
import useGetCity from "./hooks/useGetCity";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetMyShop from "./hooks/useGetMyShop";
import { useGetShopsByCity } from "./hooks/useGetShopsByCity";
import { useGetItemByCity } from "./hooks/useGetItemByCity";

import AquaBot from "./components/AquaBot";

export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

function App() {
  const { userData, city } = useSelector((state) => state.user);

  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetShopsByCity(city);
  useGetItemByCity(city);
  
  return (
    <>
      <Routes>

      {/* Root */}
      <Route
        path="/"
        element={
          userData ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* Sign In */}
      <Route
        path="/signin"
        element={
          userData ? (
            <Navigate to="/home" replace />
          ) : (
            <SignIn />
          )
        }
      />

      {/* Sign Up */}
      <Route
        path="/signup"
        element={
          userData ? (
            <Navigate to="/home" replace />
          ) : (
            <SignUp />
          )
        }
      />

      {/* Forgot Password */}
      <Route
        path="/forgot-password"
        element={
          userData ? (
            <Navigate to="/home" replace />
          ) : (
            <ForgotPassword />
          )
        }
      />

      {/* Home */}
      <Route
        path="/home"
        element={
          userData ? (
            <Home />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* Dashboard Route Aliases */}
      <Route path="/admin-dashboard" element={<Navigate to="/home" replace />} />
      <Route path="/delivery-dashboard" element={<Navigate to="/home" replace />} />

      {/* Cart Page */}
      <Route
        path="/cart"
        element={
          userData ? (
            <CartPage />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* Product Details Page */}
      <Route
        path="/product/:id"
        element={
          userData ? (
            <ProductDetails />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* Checkout Page */}
      <Route
        path="/checkout"
        element={
          userData ? (
            <CheckoutPage />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* Order Placed Page */}
      <Route
        path="/order-placed"
        element={
          userData ? (
            <OrderPlaced />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* My Orders Page (For Normal User Tracking) */}
      <Route
        path="/my-orders"
        element={
          userData ? (
            <MyOrders />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* ✅ Owner Orders Page (For Admin/Owner Tracking) - URL is /shop-orders */}
      <Route
        path="/shop-orders"
        element={
          userData?.role === "admin" || userData?.role === "owner" ? (
            <OwnerOrders /> // ✅ Using OwnerOrders component
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      {/* Create Shop - Owner/Admin only */}
      <Route
        path="/create-shop"
        element={
          userData?.role === "owner" ||
          userData?.role === "admin" ? (
            <CreateShop />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      {/* Add Item - Owner/Admin only */}
      <Route
        path="/add-item"
        element={
          userData?.role === "owner" ||
          userData?.role === "admin" ? (
            <AddItem />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      {/* Edit Item - Owner/Admin only */}
      <Route
        path="/edit-item/:itemId"
        element={
          userData?.role === "owner" ||
          userData?.role === "admin" ? (
            <EditItem />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/home" replace />}
      />

    </Routes>

    {/* Global Floating AI Seafood Concierge Assistant */}
    <AquaBot />
    </>
  );
}

export default App;