import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";

const useGetMyShop = () => {
  // States for data, loading, and error
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch shop data
  const fetchMyShop = async () => {
    setLoading(true);
    setError(null); // Reset error before new fetch

    try {
      const res = await axios.get(
        `${serverUrl}/api/shop/my-shop`,
        {
          withCredentials: true, // Important: cookies bhejne ke liye
        }
      );

      // Agar response successful hai
      if (res.data.success) {
        setShop(res.data.shop);
      } else {
        // Agar success false hai (backend ne koi message bheja)
        setError(res.data.message || "Failed to fetch shop data");
      }

    } catch (error) {
      // Handle Axios errors
      const errorMessage = error.response?.data?.message || error.message || "Something went wrong while fetching shop";
      setError(errorMessage);
      
      // Agar 404 (Shop not found) aata hai, toh error set karo lekin shop ko null rakho
      if (error.response?.status === 404) {
        console.log("ℹ️ User doesn't have a shop yet.");
        setShop(null);
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