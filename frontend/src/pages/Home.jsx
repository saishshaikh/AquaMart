// src/pages/Home.jsx
import { useSelector } from "react-redux";
import Nav1 from "../components/Nav1";
import UserDashboard from "../components/UserDashboard";
import DeliveryDashboard from "../components/DeliveryDashboard";
import AdminDashboard from "../components/AdminDashboard";
function Home() {
  const { userData } = useSelector((state) => state.user);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl text-gray-600">Loading...</h2>
      </div>
    );
  }

  switch (userData.role) {
    case "user":
      return (
        <>
          <Nav1 />
          <UserDashboard />
        </>
      );

    case "admin":
      return (
        <>
          <Nav1 />
          <AdminDashboard />
        </>
      );

    case "deliveryboy":
      return (
        <>
          <Nav1 />
          <DeliveryDashboard />
        </>
      );

    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <h2 className="text-2xl text-red-500">Unauthorized User</h2>
        </div>
      );
  }
}

export default Home;