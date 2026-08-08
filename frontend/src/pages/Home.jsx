import { useSelector, useDispatch } from "react-redux"; 
import { useEffect } from "react";
import Nav1 from "../components/Nav1";
import UserDashboard from "../components/UserDashboard";
import DeliveryDashboard from "../components/DeliveryDashboard";
import AdminDashboard from "../components/AdminDashboard";
import useGetCurrentUser from "../hooks/useGetCurrentUser"; 
import { setUserData } from "../redux/userSlice.js"; 

function Home() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { user } = useGetCurrentUser();

  // Refresh handle karo
  useEffect(() => {
    if (user && !userData) {
      dispatch(setUserData(user));
    }
  }, [user, userData, dispatch]);

  // Loading state
  if (!userData && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white text-xl">
        Loading...
      </div>
    );
  }

  // Role extract karo
  const currentUser = userData || user;
  
  // 🟢 FIX 1: Agar role undefined aaya toh bhi error na aaye!
  let role = currentUser?.role?.trim()?.toLowerCase();
  if (!role) role = "user"; // Default role set kar diya

  console.log("Final Role =", role);

  switch (role) {
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

    case "delivery":
      return (
        <>
          <Nav1 />
          <DeliveryDashboard />
        </>
      );

    default:
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
          <h1 className="text-3xl text-red-500">Unauthorized User</h1>
          <p className="mt-3">Role : {currentUser?.role || "Unknown"}</p>
        </div>
      );
  }
}

export default Home;