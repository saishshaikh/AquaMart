import { useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setShops } from "../redux/userSlice";

export function useGetShopsByCity(city) {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/shop/all-shops`);
        if (res.data?.success) {
          dispatch(setShops(res.data.shops || []));
        }
      } catch (err) {
        console.error("Error fetching shops:", err);
      }
    };

    fetchShops();
  }, [city, dispatch]);
}