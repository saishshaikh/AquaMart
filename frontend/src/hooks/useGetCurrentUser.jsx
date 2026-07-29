import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";

const useGetCurrentUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        console.log("🔍 Calling current user API...");

        const res = await axios.get(
          `${serverUrl}/api/user/current`,
          {
            withCredentials: true,
          }
        );

        console.log("📦 API Response:", res.data);

        if (res.data.success) {
          console.log("👤 Current User:", res.data.user);
          setUser(res.data.user);
        }

      } catch (error) {
        console.log(
          "❌ Get User Error:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  return { user, loading };
};

export default useGetCurrentUser;