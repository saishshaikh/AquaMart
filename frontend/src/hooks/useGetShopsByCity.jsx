import { useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setShops } from "../redux/userSlice";

export function useGetShopsByCity(city) {
  const dispatch = useDispatch();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!city) return;
    if (hasFetched.current) return; // ✅ Dobara mat karo
    hasFetched.current = true;

    const fetchShops = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/shop/all-shops`);
        if (res.data?.success) {
          dispatch(setShops(res.data.shops));
        }
      } catch (err) {
        console.error("Error fetching shops:", err);
      }
    };

    fetchShops();
  }, [city, dispatch]); // ✅ Sirf city change hone par hi chalega
}