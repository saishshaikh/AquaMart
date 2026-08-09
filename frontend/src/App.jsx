import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";

// ✅ Imports for Shop & Items
import CreateShop from "./pages/CreateShop"; 
import AddItem from "./pages/AddItem"; 
import EditItem from "./pages/EditItem"; // ✅ EditItem successfully imported

import useGetCity from "./hooks/useGetCity";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetMyShop from "./hooks/useGetMyShop";

export const serverUrl = "http://localhost:8000";

function App() {
  const { userData } = useSelector((state) => state.user);

  useGetCurrentUser();
  useGetCity();
  useGetMyShop();

  return (
    <Routes>
      <Route
        path="/"
        element={userData ? <Navigate to="/home" /> : <Navigate to="/signin" />}
      />

      <Route
        path="/signin"
        element={userData ? <Navigate to="/home" /> : <SignIn />}
      />

      <Route
        path="/signup"
        element={userData ? <Navigate to="/home" /> : <SignUp />}
      />

      <Route
        path="/forgot-password"
        element={userData ? <Navigate to="/home" /> : <ForgotPassword />}
      />

      <Route
        path="/home"
        element={userData ? <Home /> : <Navigate to="/signin" />}
      />

      {/* ✅ Create Shop Route */}
      <Route
        path="/create-shop"
        element={userData?.role === 'owner' || userData?.role === 'admin' ? <CreateShop /> : <Navigate to="/home" />}
      />

      {/* ✅ Add Item Route */}
      <Route
        path="/add-item"
        element={userData?.role === 'owner' || userData?.role === 'admin' ? <AddItem /> : <Navigate to="/home" />}
      />

      {/* ✅ Edit Item Route (Protected with Role Check) */}
      <Route 
        path="/edit-item/:itemId" 
        element={userData?.role === 'owner' || userData?.role === 'admin' ? <EditItem /> : <Navigate to="/home" />} 
      />
    </Routes>
  );
}

export default App;