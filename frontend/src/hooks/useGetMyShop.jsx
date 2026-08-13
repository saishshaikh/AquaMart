import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux"; // ✅ useSelector add kiya
import { setMyShopData } from "../redux/ownerSlice";
import { serverUrl } from "../App";

const useGetMyShop = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  
  // ✅ Redux store se current logged-in user slice nikalein
  const { user } = useSelector((state) => state.user || state.auth || {});

  const fetchMyShop = useCallback(async () => {
    // 🔴 Role Guard: Agar User logged in nahi hai YA owner/admin nahi hai toh API hit mat karo
    const role = user?.role?.trim()?.toLowerCase();
    
    if (!user || (role !== "owner" && role !== "admin")) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${serverUrl}/api/shop/my-shop`,
        {
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        setShop(res.data.shop);
        dispatch(setMyShopData(res.data.shop));
        console.log("✅ Shop Data Updated in Redux");
      } else {
        setError(res.data?.message || "Failed to fetch shop data");
        dispatch(setMyShopData(null));
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong while fetching shop";
      setError(errorMessage);
      
      if (err.response?.status === 404) {
        console.log("ℹ️ User doesn't have a shop yet.");
        setShop(null);
        dispatch(setMyShopData(null));
      } else {
        console.error("❌ Error fetching shop:", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [user, dispatch]);

  useEffect(() => {
    fetchMyShop();
  }, [fetchMyShop]);

  return { shop, loading, error, refetch: fetchMyShop };
};

export default useGetMyShop;