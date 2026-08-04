import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";

const useGetCurrentUser = () => {
  const [user, setUser] = useState(null);

  const getCurrentUser = async () => {
    console.log("🚀 Calling Current User API...");

    try {
      const res = await axios.get(
        `${serverUrl}/api/user/current`,
        {
          withCredentials: true,
        }
      );

      console.log("✅ Current User:", res.data.user);

      setUser(res.data.user);
    } catch (error) {
      console.log("❌ Error:", error.response?.status);
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    console.log("✅ Hook Executed");
    getCurrentUser();
  }, []);

  return { user };
};

export default useGetCurrentUser;   