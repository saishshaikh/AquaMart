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
        <h2 className="text-2xl">Loading...</h2>
      </div>
    );
  }

  const role = userData.role?.trim().toLowerCase();

  console.log("Role =", role);

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
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-3xl text-red-500">
            Unauthorized User
          </h1>

          <p className="mt-3">
            Role : {userData.role}
          </p>
        </div>
      );
  }
}

export default Home;