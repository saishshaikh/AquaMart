import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";
import { setItems } from "../redux/userSlice"; 

export function useGetItemByCity(city) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${serverUrl}/api/item/all-items`);
        if (res.data?.success) {
          dispatch(setItems(res.data.items || []));
        }
      } catch (err) {
        console.error("Error fetching all items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, [city, dispatch]);

  return { loading };
}

export default useGetItemByCity;