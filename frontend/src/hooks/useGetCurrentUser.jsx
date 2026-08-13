import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const useGetCurrentUser = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  
  // 🔴 Ref flag to ensure the API runs EXACTLY ONCE
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Agar ek baar call ho chuka hai, toh dobara execute mat karo
    if (hasFetchedRef.current) return;

    const getCurrentUser = async () => {
      hasFetchedRef.current = true; // Set flag immediately

      console.log("🚀 Calling Current User API...");

      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${serverUrl}/api/user/current`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true,
          }
        );

        console.log("✅ Current User:", res.data.user);
        dispatch(setUserData(res.data.user));

      } catch (error) {
        console.log("❌ Error:", error.response?.status);
        console.log(error.response?.data || error.message);
        dispatch(setUserData(null));
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [dispatch]);

  return { loading };
};

export default useGetCurrentUser;