import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux"; // ✅ Redux dispatch add kiya
import { setMyShopData } from "../redux/ownerSlice"; // ✅ Redux action add kiya
import { serverUrl } from "../App";

const useGetMyShop = () => {
  // States for data, loading, and error
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch(); // ✅ dispatch initialize kiya

  // Function to fetch shop data
  const fetchMyShop = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        `${serverUrl}/api/shop/my-shop`,
        {
          withCredentials: true,
        }
      );

      // Agar response successful hai
      if (res.data.success) {
        setShop(res.data.shop);
        // ✅ Redux ko bhi update karo
        dispatch(setMyShopData(res.data.shop));
        console.log("✅ Shop Data Updated in Redux");
      } else {
        setError(res.data.message || "Failed to fetch shop data");
        dispatch(setMyShopData(null));
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Something went wrong while fetching shop";
      setError(errorMessage);
      
      if (error.response?.status === 404) {
        console.log("ℹ️ User doesn't have a shop yet.");
        setShop(null);
        dispatch(setMyShopData(null));
      } else {
        console.error("❌ Error fetching shop:", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // useEffect se call karo jab component mount ho
  useEffect(() => {
    fetchMyShop();
  }, []);

  // Return values so components can use them
  return { shop, loading, error, refetch: fetchMyShop };
};

export default useGetMyShop;