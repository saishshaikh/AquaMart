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

// Hooks
import useGetCity from "./hooks/useGetCity";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetMyShop from "./hooks/useGetMyShop";
import { useGetShopsByCity } from "./hooks/useGetShopsByCity";
import { useGetItemByCity } from "./hooks/useGetItemByCity";

export const serverUrl = "http://localhost:8000";

function App() {
  // ✅ userData aur city dono ko Redux se extract karein
  const { userData, city } = useSelector((state) => state.user);

  // Current logged-in user
  useGetCurrentUser();

  // User/Admin live location
  useGetCity();

  // Logged-in owner's shop
  useGetMyShop();

  // Shops according to user's city
  useGetShopsByCity();

  // ✅ Items according to city (Ab yahan city defined hai, error nahi aayega)
  useGetItemByCity(city);
  
  return (
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
  );
}

export default App;