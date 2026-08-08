import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";

// ✅ FIXED: Exact file name match kiya (Capital C, Capital S)
import CreateShop from "./pages/CreateShop"; 

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
    </Routes>
  );
}

export default App;