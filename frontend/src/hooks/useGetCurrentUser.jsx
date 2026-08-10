import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const useGetCurrentUser = () => {
  const [loading, setLoading] = useState(true); // ✅ Loading state add kar di hai
  const dispatch = useDispatch();

  useEffect(() => {
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
        dispatch(setUserData(res.data.user));

      } catch (error) {
        console.log("❌ Error:", error.response?.status);
        console.log(error.response?.data || error.message);
        dispatch(setUserData(null));
      } finally {
        setLoading(false); // ✅ API call khatam hote hi loading false ho jayegi
      }
    };

    getCurrentUser();
  }, [dispatch]);

  return { loading }; // ✅ Loading state return kar rahe hain
};

export default useGetCurrentUser;