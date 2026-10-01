import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const useGetCurrentUser = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  
  // 🔴 Ref flag - Ensure API runs EXACTLY ONCE
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Sirf ek baar chalega
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const getCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          dispatch(setUserData(null));
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${serverUrl}/api/user/current`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        dispatch(setUserData(res.data.user)); // ✅ Ek baar set karo
      } catch (error) {
        dispatch(setUserData(null)); // ✅ Error par null set karo
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []); // ✅ EMPTY DEPENDENCY ARRAY - SABSE IMPORTANT!

  return { loading };
};

export default useGetCurrentUser;