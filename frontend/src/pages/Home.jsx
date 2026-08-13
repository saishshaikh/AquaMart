import { useSelector } from "react-redux";
import Nav1 from "../components/Nav1";
import UserDashboard from "../components/UserDashboard";
import DeliveryDashboard from "../components/DeliveryDashboard";
import AdminDashboard from "../components/AdminDashboard";
import useGetCurrentUser from "../hooks/useGetCurrentUser";

function Home() {
  const { loading } = useGetCurrentUser();
  const { userData } = useSelector((state) => state.user);

  // 1. Loading State Screen
  if (loading && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white text-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // 2. Safe Role Normalize
  const role = userData?.role?.trim()?.toLowerCase() || "user";

  // 3. Conditional Rendering based on Role
  switch (role) {
    case "user":
      return (
        <div className="min-h-screen bg-[#020617]">
          <Nav1 />
          <UserDashboard />
        </div>
      );

    case "admin":
    case "owner":
      return (
        <div className="min-h-screen bg-[#020617]">
          <Nav1 />
          <AdminDashboard />
        </div>
      );

    case "delivery":
    case "delivery_boy":
    case "deliveryboy":
      return (
        <div className="min-h-screen bg-[#020617]">
          {/* Active delivery view */}
          <Nav1 />
          <DeliveryDashboard />
        </div>
      );

    default:
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
          <h1 className="text-3xl text-red-500 font-bold">Unauthorized User</h1>
          <p className="mt-3 text-slate-400">
            Role: <span className="text-cyan-400">{userData?.role || "Unknown"}</span>
          </p>
        </div>
      );
  }
}

export default Home;