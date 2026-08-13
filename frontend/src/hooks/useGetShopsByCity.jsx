import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setShops } from "../redux/userSlice"; // Apne Redux slice path ke mutabiq check karein

export function useGetShopsByCity() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllShops = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/shop/all-shops`);
        if (res.data?.success) {
          dispatch(setShops(res.data.shops));
        }
      } catch (err) {
        console.error("Error fetching all shops:", err);
      }
    };

    fetchAllShops();
  }, [dispatch]);
}

export default useGetShopsByCity;